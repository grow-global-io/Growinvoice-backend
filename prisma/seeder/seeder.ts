import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const currenciesPath = path.resolve(__dirname, 'currencies.json');
  const countriesPath = path.resolve(__dirname, 'countries.json');
  const statesPath = path.resolve(__dirname, 'states.json');
  const invoicePath = path.resolve(__dirname, 'invoicetemplate.json');
  const currenciesData = JSON.parse(fs.readFileSync(currenciesPath, 'utf-8'));
  const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));
  const statesData = JSON.parse(fs.readFileSync(statesPath, 'utf-8'));
  const invoiceData = JSON.parse(fs.readFileSync(invoicePath, 'utf-8'));
  console.log('Seeding currencies...', currenciesData);
  const currenciesMap = currenciesData.map((currency) => {
    return {
      name: currency.name,
      symbol: currency.symbol,
      code: currency.code,
      short_code: currency.short_code,
    };
  });

  const countriesMap = countriesData.map((country) => {
    return {
      id: country.id,
      name: country.name,
      code: country.code,
      phone_code: country.phonecode,
    };
  });

  const statesMap = statesData.map((state) => {
    return {
      name: state.name,
      country_id: state.country_id,
    };
  });

  dotenv.config();
  /// --------- Users ---------------
  await prisma.currencies.createMany({ data: currenciesMap });
  console.log('Seeding countries...', countriesMap?.length);
  await prisma.country.createMany({ data: countriesMap });
  console.log('Seeding states...', statesData?.length);
  await prisma.state.createMany({ data: statesMap });
  console.log('Seeding invoice template...');
  await prisma.invoiceTemplate.createMany({
    data: invoiceData,
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
