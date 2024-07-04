import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as pdfhtmlPdf from 'html-pdf';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import nodeHtmlToImage from 'node-html-to-image';

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

  async createWithJspdf() {
    const htmla = await axios.get(
      'https://growinvoice-94ee0dd2031b.herokuapp.com/api/invoice/test/cly5pbjbu0005emyec2tfxqn4',
    );
    const htmlData = htmla?.data;
    return createPdf(htmlData);
  }

  async generateImage(html: string) {
    const image = await nodeHtmlToImage({
      html: html.toString(),
      puppeteerArgs: {
        args: [
          '--disable-gpu',
          '--no-sandbox',
          '--lang=en-US',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      },
    });

    return await image;
  }

  async createPdfInOneFile() {
    const htmla = await axios.get(
      'https://growinvoice-94ee0dd2031b.herokuapp.com/api/invoice/test/cly5pbjbu0005emyec2tfxqn4',
    );
    const htmlData = htmla?.data;

    const buffer2 = await this.generateImage(htmlData);

    return buffer2;
  }
}
