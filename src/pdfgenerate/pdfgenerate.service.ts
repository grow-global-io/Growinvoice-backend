import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as pdfhtmlPdf from 'html-pdf';

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
}
