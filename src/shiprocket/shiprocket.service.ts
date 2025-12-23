import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface ShiprocketAuthResponse {
  token: string;
}

@Injectable()
export class ShiprocketService {
  private readonly logger = new Logger(ShiprocketService.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;

  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('SHIPROCKET_BASE_URL') ||
      'https://apiv2.shiprocket.in/v1/external';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000,
    });
  }

  private async getAuthToken(): Promise<string> {
    const email = this.configService.get<string>('SHIPROCKET_EMAIL');
    const password = this.configService.get<string>('SHIPROCKET_API_PASSWORD');

    if (!email || !password) {
      throw new BadRequestException(
        'Shiprocket credentials are not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_API_PASSWORD in the environment.',
      );
    }

    // Reuse token if still valid
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      const response = await this.client.post<ShiprocketAuthResponse>(
        '/auth/login',
        {
          email,
          password,
        },
      );

      if (!response.data?.token) {
        throw new Error('Invalid Shiprocket auth response (no token)');
      }

      this.token = response.data.token;
      // Shiprocket tokens are typically valid for 10 hours – set a safety window of 9 hours
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 9);
      this.tokenExpiry = expiry;

      return this.token;
    } catch (error: any) {
      // Enhanced error logging for debugging
      if (error.response) {
        this.logger.error(
          `Shiprocket auth failed - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`,
        );
        this.logger.error(
          `Request URL: ${this.baseUrl}/auth/login, Email: ${email}`,
        );
      } else if (error.request) {
        this.logger.error(
          'Shiprocket auth failed - No response received',
          error.request,
        );
      } else {
        this.logger.error('Shiprocket auth failed', error.message);
      }

      // Provide more specific error messages
      if (error.response?.status === 403) {
        throw new BadRequestException(
          'Shiprocket authentication failed (403): Invalid credentials or insufficient permissions. ' +
            'IMPORTANT: You must create a dedicated API user in Shiprocket (Settings > API > Configure), ' +
            'not use your regular login credentials. Use the API user email and password in SHIPROCKET_EMAIL and SHIPROCKET_API_PASSWORD.',
        );
      } else if (error.response?.status === 401) {
        throw new BadRequestException(
          'Shiprocket authentication failed (401): Unauthorized. Please check your API user credentials. ' +
            'Make sure you are using the API user credentials created in Shiprocket Settings > API > Configure.',
        );
      } else if (error.response?.data?.message) {
        throw new BadRequestException(
          `Shiprocket authentication failed: ${error.response.data.message}`,
        );
      }

      throw new BadRequestException(
        'Failed to authenticate with Shiprocket. Please check your credentials and network connection.',
      );
    }
  }

  private async authorizedRequest<T>(
    method: 'get' | 'post',
    url: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any,
  ): Promise<T> {
    const token = await this.getAuthToken();

    try {
      const response = await this.client.request<T>({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Shiprocket request failed: ${method.toUpperCase()} ${url}`,
        error as any,
      );
      throw new BadRequestException('Shiprocket API request failed');
    }
  }

  // Create a Shiprocket order based on checkout + invoice details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createOrderFromCheckout(payload: {
    orderId: string;
    orderDate: Date;
    customerName: string;
    email: string;
    phone: string;
    shipping: {
      address: string;
      city: string;
      state: string;
      country: string;
      pincode: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[];
    subTotal: number;
    paymentMethod?: 'Prepaid' | 'COD';
  }): Promise<unknown> {
    const shiprocketPayload = {
      order_id: payload.orderId,
      order_date: payload.orderDate.toISOString(),
      billing_customer_name: payload.customerName,
      billing_last_name: '',
      billing_address: payload.shipping.address,
      billing_city: payload.shipping.city,
      billing_pincode: payload.shipping.pincode,
      billing_state: payload.shipping.state,
      billing_country: payload.shipping.country,
      billing_email: payload.email,
      billing_phone: payload.phone,
      shipping_is_billing: false,
      shipping_customer_name: payload.customerName,
      shipping_last_name: '',
      shipping_address: payload.shipping.address,
      shipping_city: payload.shipping.city,
      shipping_pincode: payload.shipping.pincode,
      shipping_country: payload.shipping.country,
      shipping_state: payload.shipping.state,
      shipping_email: payload.email,
      shipping_phone: payload.phone,
      order_items: payload.items,
      payment_method: payload.paymentMethod || 'Prepaid',
      sub_total: payload.subTotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 1,
    };

    return await this.authorizedRequest(
      'post',
      '/orders/create/adhoc',
      shiprocketPayload,
    );
  }

  async trackByAwb(awb: string): Promise<unknown> {
    return await this.authorizedRequest('get', `/courier/track/awb/${awb}`);
  }

  async trackByShipmentId(shipmentId: string): Promise<unknown> {
    return await this.authorizedRequest(
      'get',
      `/courier/track/shipment/${shipmentId}`,
    );
  }
}
