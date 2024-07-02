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
import { camelCaseToNormalString, chartData } from '@shared/utils/constants';

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
    const messages = `I have a Prisma.js Schema that you can read below: ${schema} and Write an SQL Query that will satisfy question: ${createOpenaiDto?.prompt} Respond only with an SQL Query for PostgreSQL that will satisfy the question. Make sure that SQL query is only for PostgreSQL db and table name should be in double quotes and table name should be same like in schema(make sure with capital letters). and if question is related to BigInt or Count then count result is cast to a text(like: CAST(count(*) AS TEXT)). The query should be specific to the user with ID: ${user_id}. even question is related to other user's data but query should be specific to the user with ID: ${user_id} only. Make sure that the query is safe and secure. Make sure that count result is cast to a text(like: CAST(count(*) AS TEXT)). if USER request is related to date or month or year then Make sure to use format also`;
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
    const resulta = await this.create(createOpenaiDto, user_id);
    const graphGenPrompt = `i want to generate a graph json data format. First, define the graph type whether it is a ${Object?.keys(
      chartData,
    )
      ?.map((key) => camelCaseToNormalString(key))
      ?.join(
        ',',
      )}. then generate the graph JSON data format for the graph. here are the some sample data: 
      for column chart with data labels: ${JSON.stringify(chartData?.columnChartWithDataLabels)},
        for basic column chart: ${JSON.stringify(chartData?.basicColumnCharts)},
        for stacked column chart: ${JSON.stringify(chartData?.stackedColumnCharts)},
        for basic line chart: ${JSON.stringify(chartData?.basicLineCharts)},
        for line chart with data labels: ${JSON.stringify(chartData?.lineChartWithDataLabels)},
        for basic area chart: ${JSON.stringify(chartData?.simpleBasicPieCharts)}. also and the data should be generated from the following data: ${JSON.stringify(resulta)}. if generated data is empty, then generate graph JSON with empty data and respond only with a JSON data format for the graph. Make sure that every information need to be change and related to user request: ${createOpenaiDto?.prompt} and if user request is related to date or month or year then Make sure to use format also. and if user request is related to every month or every year or every day like that, then MAKE SURE TO take last 10 days, years, months from july or 2024 year. MAKE SURE respond only with json data format for the graph. MAKE SURE don't respond with any other information OR Dummy data. use the data from the query result.`;
    const graphResult =
      await this.genAiProJsonModel.generateContent(graphGenPrompt);
    const graphResponse = await graphResult?.response;
    const graphText = graphResponse?.text();
    const graphSplit = graphText?.startsWith('```json')
      ? graphText.split('```json')[1].split('```')[0]
      : graphText;
    console.log(graphSplit);
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

  async getChatWithOpenAI(
    user_id: string,
    createOpenaiDto: RequestBodyOpenaiDto[],
  ) {
    const schema = fs.readFileSync('./prisma/schema.prisma', 'utf8');
    const messages = `Prisma.js Schema is: ${schema}. i want to do a chat with you for {prompt}. respond if you require any other information frome me. if you need any other information from me then please ask me for that. OR if you want to know about any other thing then please ask me for that. once you get all the information then please RESPOND only with SQL QUERY for POSTGRESQL DB OR respond what you need. i want to create the record only for the user with ID: ${user_id}`;

    const result = await this.genAiProModel.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
        {
          role: 'model',
          parts: [
            {
              text: 'Hello, may I know how can I help you today',
            },
          ],
        },
        {
          role: 'user',
          parts: [
            { text: messages?.replace('{prompt}', createOpenaiDto[0]?.prompt) },
          ],
        },
      ],
    });

    const msg = `i want to create a product with the following details:
    name: "Product Name",
    description: "Product Description",
    price: 100,
    user_id: ${user_id},
    type: Service,
    currencies: INR,
    unit: MONDD`;
    const resulta = await result?.sendMessage(msg);
    const response = await resulta?.response;
    console.log(response);
    const text = response?.text();
    const checkisSQL = text?.includes('```sql');
    if (checkisSQL) {
      const querySplit = text.split('```sql')[1].split('```')[0];
      const singleLineQuery = querySplit.replace(/\s+/g, ' ').trim();
      console.log(singleLineQuery);
      const resulta = await this.prismaServe.$queryRawUnsafe(singleLineQuery);
      return resulta;
    }
    return text;
  }
}
