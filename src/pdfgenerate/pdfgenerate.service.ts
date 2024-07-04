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

    pdfhtmlPdf
      .create(htmlData, {
        format: 'A4', // Adjusted format to A4
        orientation: 'portrait',
      })
      .toBuffer((err, buffer) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error generating PDF');
          return;
        }

        // Set the response headers to indicate a file attachment
        res.setHeader('Content-Type', 'application/pdf');

        // Send the buffer as the response
        res.send(buffer);
      });
  }
}
