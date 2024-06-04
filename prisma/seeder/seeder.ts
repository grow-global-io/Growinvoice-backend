import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
// const currenciesMap = currencies.map((currency) => {
//   return {
//     name: currency.name,
//     symbol: currency.symbol,
//     code: currency.code,
//     short_code: currency.short_code,
//   };
// });

async function main() {
  const currenciesPath = path.resolve(__dirname, 'currencies.json');
  const currenciesData = JSON.parse(fs.readFileSync(currenciesPath, 'utf-8'));
  console.log('Seeding currencies...', currenciesData);
  const currenciesMap = currenciesData.map((currency) => {
    return {
      name: currency.name,
      symbol: currency.symbol,
      code: currency.code,
      short_code: currency.short_code,
    };
  });
  dotenv.config();
  /// --------- Users ---------------
  await prisma.currencies.createMany({ data: currenciesMap });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
