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

  chatGptDescribe = `"""
    You are an expert SQL Specialist. Convert natural language queries to SQL QUERY  for PostgreSQL, ensuring they only access data related to user with ID {{ user_id }}.
    Schema (Prisma.js): ${fs.readFileSync('./prisma/schema.prisma', 'utf8')}.
    Requirements:
    - Use table names exactly as in the schema (with capital letters).
    - Use table names in double quotes ("") to avoid case sensitivity issues.
    - For BigInt or Count, cast results to text (CAST(count(*) AS TEXT)).
    - Ensure queries are safe, secure, user-specific (only data for user ID {{ user_id }}) and DONOT INCLUDE OTHERS DATA EVEN USER REQUESTED it should be user-specific (only data for user ID {{ user_id }}).
    - Format date-related queries appropriately.
    - EVEN USER REQUESTED NOT RELATED TO HIS DATA THEN RESPOND WITH NO DATA.
    - respond only with SQL query for PostgreSQL DB.
    - STRICTLY FOLLOW THE ABOVE REQUIREMENTS.
    - STRICTLY RESPOND ONLY WITH SQL QUERY. DONOT RESPOND WITH ANY OTHER INFORMATION or with text.
    """"`;

  chartDataDescribe = `"""
    You are an expert JSON Specialist. Convert SQL query results to JSON data format for graphing. Ensure the JSON matches the sample data format.
    
    For the user request prompt: {{ user_request_prompt }}:
    
    1. Identify the graph type: ${Object?.keys(chartData)
      ?.map((key) => camelCaseToNormalString(key))
      ?.join(', ')}.
    2. From the results: {{ generated_data }} - Generate the graph JSON data format exactly like the sample data:

       - **Bar or Column Chart**:
         - Column chart with data labels: ${JSON.stringify(chartData?.columnChartWithDataLabels)}
         - Basic column chart: ${JSON.stringify(chartData?.basicColumnCharts)}
         - Stacked column chart: ${JSON.stringify(chartData?.stackedColumnCharts)}
       
       - **Line Chart**:
         - Basic line chart: ${JSON.stringify(chartData?.basicLineCharts)}
         - Line chart with data labels: ${JSON.stringify(chartData?.lineChartWithDataLabels)}
       
       - **Pie Chart**:
         - Basic pie chart: ${JSON.stringify(chartData?.BasicPieCharts)}
       
    Ensure the JSON matches the corresponding sample data and is generated from the query result: {{ generated_data }}. If no data is available, generate an empty graph JSON format. if data is available only for a few, but the user requested more data, respond with "no data" or 0.
    
    Make sure every detail is related to the user request: {{ user_request_prompt }}. Respond only with the JSON data format for the graph.
"""`;

  async create(createOpenaiDto: RequestBodyOpenaiDto, user_id: string) {
    const chatgpt = this.chatGptDescribe.replaceAll('{{ user_id }}', user_id);

    const result = await this.genAiProModel.generateContent([
      chatgpt,
      createOpenaiDto?.prompt,
    ]);
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
    console.log(resulta);
    return resulta;
  }

  async createGraph(createOpenaiDto: RequestBodyOpenaiDto, user_id: string) {
    const resulta = await this.create(createOpenaiDto, user_id);
    const graphGenPrompt = this.chartDataDescribe.replaceAll(
      '{{ user_request_prompt }}',
      createOpenaiDto?.prompt,
    );
    const graphResulted = graphGenPrompt.replaceAll(
      '{{ generated_data }}',
      JSON.stringify(resulta),
    );

    const graphResult = await this.genAiProJsonModel.generateContent([
      graphResulted,
      createOpenaiDto?.prompt,
    ]);
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
