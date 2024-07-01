import { Injectable } from '@nestjs/common';
import { RequestBodyOpenaiDto } from './dto/request-body-openai.dto';
import * as fs from 'fs';
import { PrismaService } from '@/prisma/prisma.service';
import {
  GenerativeModel,
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenaiService {
  private genAI: GoogleGenerativeAI;
  private genAiProModel: GenerativeModel;
  private genAiProJsonModel: GenerativeModel;

  private safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  constructor(
    private prismaServe: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get('GOOGLE_API_KEY'),
    );

    this.genAiProModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.4,
        topP: 1,
        topK: 32,
        maxOutputTokens: 4096,
      },
      safetySettings: this?.safetySettings,
    });

    this.genAiProJsonModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.4,
        topP: 1,
        topK: 32,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
      safetySettings: this?.safetySettings,
    });
  }

  async create(createOpenaiDto: RequestBodyOpenaiDto, user_id: string) {
    const schema = fs.readFileSync('./prisma/schema.prisma', 'utf8');
    const messages = `I have a Prisma.js Schema that you can read below: ${schema} and Write an SQL Query that will satisfy question: ${createOpenaiDto?.prompt} Respond only with an SQL Query for PostgreSQL that will satisfy the question. Make sure that SQL query is only for PostgreSQL db and table name should be in double quotes and table name should be same like in schema(make sure with capital letters). and if question is related to BigInt or Count then count result is cast to a text(like: CAST(count(*) AS TEXT)). The query should be specific to the user with ID: ${user_id}. even question is related to other user's data but query should be specific to the user with ID: ${user_id} only. Make sure that the query is safe and secure. Make sure that count result is cast to a text(like: CAST(count(*) AS TEXT)). if USER request is related to date or month or year then Make sure to use date_trunc function with format.`;
    const result = await this.genAiProModel.generateContent(messages);
    const response = await result?.response;
    const text = response?.text();
    const querySplit = text.split('```sql')[1].split('```')[0];
    const singleLineQuery = querySplit.replace(/\s+/g, ' ').trim();
    await this?.prismaServe?.openAiHistory?.upsert({
      where: {
        user_id_query: {
          user_id,
          query: createOpenaiDto?.prompt,
        },
      },

      create: {
        query: createOpenaiDto?.prompt,
        result: singleLineQuery,
        user_id,
      },
      update: {
        query: createOpenaiDto?.prompt,
        result: singleLineQuery,
        user_id,
      },
    });
    console.log(singleLineQuery);
    const resulta = await this.prismaServe.$queryRawUnsafe(singleLineQuery);
    return resulta;
  }

  async createGraph(createOpenaiDto: RequestBodyOpenaiDto, user_id: string) {
    const graphSample = {
      series: [
        {
          name: 'Inflation',
          data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2],
        },
      ],
      options: {
        chart: {
          height: 350,
          type: 'bar',
        },
        plotOptions: {
          bar: {
            borderRadius: 10,
            dataLabels: {
              position: 'top', // top, center, bottom
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val + '%';
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758'],
          },
        },

        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          position: 'top',
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          crosshairs: {
            fill: {
              type: 'gradient',
              gradient: {
                colorFrom: '#D8E3F0',
                colorTo: '#BED1E6',
                stops: [0, 100],
                opacityFrom: 0.4,
                opacityTo: 0.5,
              },
            },
          },
          tooltip: {
            enabled: true,
          },
        },
        yaxis: {
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
            formatter: function (val) {
              return val + '%';
            },
          },
        },
        title: {
          text: 'Monthly Inflation in Argentina, 2002',
          floating: true,
          offsetY: 330,
          align: 'center',
          style: {
            color: '#444',
          },
        },
      },
    };

    const resulta = await this.create(createOpenaiDto, user_id);
    const graphGenPrompt = `i want to generate a graph json data format should be same like : ${JSON.stringify(graphSample)} and the data should be generated from the following data: ${JSON.stringify(resulta)} and respond only with a JSON data format for the graph.`;
    const graphResult =
      await this.genAiProJsonModel.generateContent(graphGenPrompt);
    const graphResponse = await graphResult?.response;
    const graphText = graphResponse?.text();
    const graphSplit = graphText?.startsWith('```json')
      ? graphText.split('```json')[1].split('```')[0]
      : graphText;
    const graphData = JSON.parse(graphSplit);
    return graphData;
  }

  async suggestions(searchTerm: string, user_id: string) {
    const fetchSuggestions = await this.prismaServe.openAiHistory.findMany({
      where: {
        user_id,
        OR: searchTerm ? [{ query: { contains: searchTerm } }] : undefined,
      },
      take: 100,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const results = fetchSuggestions.map((suggest) => {
      return {
        value: suggest.query,
        label: suggest.query,
      };
    });
    return results;
  }
}
