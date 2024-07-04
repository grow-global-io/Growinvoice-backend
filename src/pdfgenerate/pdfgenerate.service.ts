import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as pdfhtmlPdf from 'html-pdf';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfgenerateService {
  async createWithHtmlPdf(res: any) {
    const htmla = await axios.get(
      'https://growinvoice-94ee0dd2031b.herokuapp.com/api/invoice/test/cly5pbjbu0005emyec2tfxqn4',
    );
    const htmlData = htmla?.data;

    return new Promise((resolve, reject) => {
      pdfhtmlPdf
        .create(htmlData, {
          childProcessOptions: {
            detached: true,
          },
        })
        .toStream((err, stream) => {
          if (err) {
            reject(err);
          } else {
            stream.pipe(res);
            resolve(stream);
          }
        });
    });
  }

  async createWithPuppeteer() {
    const browser = await puppeteer.launch({
      ignoreDefaultArgs: ['--disable-extensions'],
    });
    const page = await browser.newPage();
    await page.goto(
      'https://growinvoice-94ee0dd2031b.herokuapp.com/api/invoice/test/cly5pbjbu0005emyec2tfxqn4',
      {
        waitUntil: 'networkidle0',
      },
    );
    const pdf = await page.pdf();
    await browser.close();
    return pdf;
  }
}
