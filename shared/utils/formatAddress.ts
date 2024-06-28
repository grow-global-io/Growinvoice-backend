import { InvoiceWithAllDataDto } from '@/invoice/dto/invoice-with-all-data.dto';

const companyAddressExpressionsMap = {
  '{company.name}': 'invoiceData?.user?.company[0]?.name',
  '{company.address}': 'invoiceData?.user?.company[0]?.address',
  '{company.phone}': 'invoiceData?.user?.company[0]?.phone',
  '{company.country}': 'invoiceData?.user?.company[0]?.country?.name',
  '{company.state}': 'invoiceData?.user?.company[0]?.state?.name',
  '{company.city}': 'invoiceData?.user?.company[0]?.city',
  '{company.zip}': 'invoiceData?.user?.company[0]?.zip',
  '{company.vat}': 'invoiceData?.user?.company[0]?.vat',
};

const customerBillingAddressExpressionsMap = {
  '{customer.name}': 'invoiceData?.customer?.name',
  '{customer.address}': 'invoiceData?.customer?.billingAddress?.address',
  '{customer.phone}': 'invoiceData?.customer?.phone',
  '{customer.country}': 'invoiceData?.customer?.billingAddress?.country?.name',
  '{customer.state}': 'invoiceData?.customer?.billingAddress?.state?.name',
  '{customer.city}': 'invoiceData?.customer?.billingAddress?.city',
  '{customer.zip}': 'invoiceData?.customer?.billingAddress?.zip',
  '{customer.vat}': 'invoiceData?.customer?.billingAddress?.vat',
};

const customerShippingAddressExpressionsMap = {
  '{customer.name}': 'invoiceData?.customer?.name',
  '{customer.address}': 'invoiceData?.customer?.shippingAddress?.address',
  '{customer.phone}': 'invoiceData?.customer?.phone',
  '{customer.country}': 'invoiceData?.customer?.shippingAddress?.country?.name',
  '{customer.state}': 'invoiceData?.customer?.shippingAddress?.state?.name',
  '{customer.city}': 'invoiceData?.customer?.shippingAddress?.city',
  '{customer.zip}': 'invoiceData?.customer?.shippingAddress?.zip',
  '{customer.vat}': 'invoiceData?.customer?.shippingAddress?.vat',
};

export function formatCompanyAddress(
  invoiceData: InvoiceWithAllDataDto,
  expressionString: string,
): string {
  if (!invoiceData) return '';

  const addressParts = expressionString.split('<br>').map((part) => {
    let formattedPart = part;
    Object.entries(companyAddressExpressionsMap).forEach(([key, value]) => {
      formattedPart = formattedPart.replace(key, eval(value));
    });
    return formattedPart;
  });

  return addressParts.join('<br>');
}

export function formatCustomerBillingAddress(
  invoiceData: InvoiceWithAllDataDto,
  expressionString: string,
): string {
  if (!invoiceData) return '';

  const addressParts = expressionString.split('<br>').map((part) => {
    let formattedPart = part;
    Object.entries(customerBillingAddressExpressionsMap).forEach(
      ([key, value]) => {
        formattedPart = formattedPart.replace(key, eval(value));
      },
    );
    return formattedPart;
  });

  return addressParts.join('<br>');
}

export function formatCustomerShippingAddress(
  invoiceData: InvoiceWithAllDataDto,
  expressionString: string,
): string {
  if (!invoiceData) return '';

  const addressParts = expressionString.split('<br>').map((part) => {
    let formattedPart = part;
    Object.entries(customerShippingAddressExpressionsMap).forEach(
      ([key, value]) => {
        formattedPart = formattedPart.replace(key, eval(value));
      },
    );
    return formattedPart;
  });

  return addressParts.join('<br>');
}
