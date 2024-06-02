import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserCompany } from './dto/create-user-company.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async createUser(data: CreateUserCompany) {
    try {
      const response = await axios.post(
        `https://${this.configService.get('AUTH0_DOMAIN')}/dbconnections/signup`,
        {
          client_id: this.configService.get('AUTH0_CLIENT_ID'),
          email: data.email,
          password: data.password,
          connection: 'Username-Password-Authentication',
          given_name: data.name,
          family_name: data.name,
          name: data.name,
          nickname: data.name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      await this.prismaService.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          id: response.data._id,
          company: {
            create: {
              name: data.companyName,
            },
          },
        },
      });
      return {
        message: 'User created successfully',
        status: 201,
      };
    } catch (error) {
      console.log(error?.response?.data);
      throw new BadRequestException(
        error?.response?.data?.description === 'Invalid sign up'
          ? 'User already exists'
          : error?.response?.data?.error_description ??
            error?.response?.data?.description ??
            error?.response?.data?.error ??
            'Error creating user',
      );
    }
  }

  async login(data: LoginUserDto) {
    try {
      const response = await axios.post(
        `https://${this.configService.get('AUTH0_DOMAIN')}/oauth/token`,
        {
          grant_type: 'password',
          username: data.email,
          password: data.password,
          audience: `https://${this.configService.get('AUTH0_DOMAIN')}/api/v2/`,
          scope: 'openid profile email',
          client_id: this.configService.get('AUTH0_CLIENT_ID'),
          client_secret: this.configService.get('AUTH0_CLIENT_SECRET'),
        },
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.data?.error_description ??
          error?.response?.data?.description ??
          error?.response?.data?.error ??
          'Error logging in',
      );
    }
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async passwordLessLogin(email: string) {
    try {
      const response = await axios.post(
        `https://${this.configService.get('AUTH0_DOMAIN')}/passwordless/start`,
        {
          client_id: this.configService.get('AUTH0_CLIENT_ID'),
          client_secret: this.configService.get('AUTH0_CLIENT_SECRET'),
          connection: 'email',
          email: email, //set for connection=email
          send: 'code', //if left null defaults to link
          authParams: {
            scope: 'openid profile email',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.data?.error_description ??
          error?.response?.data?.description ??
          error?.response?.data?.error ??
          'Error logging in',
      );
    }
  }

  async passwordLessLoginVerify(email: string, code: string) {
    try {
      const response = await axios.post(
        `https://${this.configService.get('AUTH0_DOMAIN')}/oauth/token`,
        {
          grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
          client_id: this.configService.get('AUTH0_CLIENT_ID'),
          client_secret: this.configService.get('AUTH0_CLIENT_SECRET'),
          otp: code,
          realm: 'email',
          username: email,
          audience: `https://${this.configService.get('AUTH0_DOMAIN')}/api/v2/`,
          scope: 'openid profile email',
        },
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.data?.error_description ??
          error?.response?.data?.description ??
          error?.response?.data?.error ??
          'Error logging in',
      );
    }
  }

  async changePassword(email: string) {
    try {
      const response = await axios.post(
        `https://${this.configService.get('AUTH0_DOMAIN')}/dbconnections/change_password`,
        {
          client_id: this.configService.get('AUTH0_CLIENT_ID'),
          email,
          connection: 'Username-Password-Authentication',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException(
        error?.response?.data?.error_description ??
          error?.response?.data?.description ??
          error?.response?.data?.error ??
          'Error changing password',
      );
    }
  }
}
