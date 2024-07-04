import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as pdfhtmlPdf from 'html-pdf';
import { createPdf } from '@saemhco/nestjs-html-pdf';
import { createCanvas } from 'canvas';
import * as echarts from 'echarts';
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

  generateEchartCanvas(option: any) {
    const canvas = createCanvas(600, 600);
    const ctx2 = canvas.getContext('2d');

    const chart = echarts.init(canvas as any);

    chart.setOption(option);

    return canvas.toBuffer('image/png');
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
    const echartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisTick: {
            alignWithLabel: true,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: [
        {
          name: 'Direct',
          type: 'bar',
          barWidth: '60%',
          data: [10, 52, 200, 334, 390, 330, 220],
        },
      ],
    };

    const htmlCode = htmlData;

    const buffer2 = await this.generateImage(htmlCode);

    return buffer2;
  }
}
