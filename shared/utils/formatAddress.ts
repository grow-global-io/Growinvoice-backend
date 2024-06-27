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
