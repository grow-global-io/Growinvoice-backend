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
import { DashboardsService } from '@/dashboards/dashboards.service';
import OpenAI from 'openai';

export interface ExtractInvoiceResponse {
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country_name: string | null;
  };
  invoice_number: string | null;
  date: string | null;
  due_date: string | null;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number | null;
  total: number | null;
  tax_amount: number | null;
  currency_code: string | null;
  notes: string | null;
}

@Injectable()
export class OpenaiService {
  private genAI: GoogleGenerativeAI;
  private genAiProModel: GenerativeModel;
  private genAiProJsonModel: GenerativeModel;
  private openai: OpenAI; // OpenAI client instance

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
    private readonly dashboardService: DashboardsService,
  ) {
    // this.genAI = new GoogleGenerativeAI(
    //   this.configService.get('GOOGLE_API_KEY'),
    // );

    // this.genAiProModel = this.genAI.getGenerativeModel({
    //   model: 'gemini-2.0-flash-lite',
    //   generationConfig: {
    //     temperature: 0.4,
    //     topP: 1,
    //     topK: 32,
    //     maxOutputTokens: 4096,
    //   },
    //   safetySettings: this?.safetySettings,
    // });

    // this.genAiProJsonModel = this.genAI.getGenerativeModel({
    //   model: 'gemini-2.0-flash-lite',
    //   generationConfig: {
    //     temperature: 0.4,
    //     topP: 1,
    //     topK: 32,
    //     maxOutputTokens: 4096,
    //     responseMimeType: 'application/json',
    //   },
    //   safetySettings: this?.safetySettings,
    // });
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  chatGptDescribe = `"""
  You are an expert SQL Specialist. Convert natural language queries to SQL QUERY for PostgreSQL, ensuring they only access data related to user with ID {{ user_id }}.
  Schema (Prisma.js): ${fs.readFileSync('./prisma/schema.prisma', 'utf8')}.
  Requirements:
  - Use table names exactly as in the schema (with capital letters) and enclose them in double quotes ("").
  - **Crucially, any column that is a BigInt or the result of an aggregation like COUNT must be cast to TEXT. For example, CAST("someBigIntColumn" AS TEXT) or CAST(COUNT(*) AS TEXT). This is a strict requirement to prevent serialization errors.**
  - Ensure all queries are user-specific (WHERE "userId" = '{{ user_id }}') and secure. Do not include data for other users, even if requested. If a request is not for the user's data, respond with a query that returns no rows, like 'SELECT 1 WHERE false;'.
  - Format date-related queries appropriately.
  - DO NOT query for unnecessary columns like id, createdAt, updatedAt unless specifically asked.
  - You can and should JOIN tables when required to fulfill the user's request.
  - Use user-friendly column aliases where appropriate (e.g., SELECT "firstName" AS "First Name").
  - **STRICTLY RESPOND ONLY WITH THE SQL QUERY.** Do not include any other text, explanations, or markdown formatting like \`\`\`sql.
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
    - MAKE SURE TO GIVE USER-FRIENDLY NAMES FOR THE DATA.
"""`;

  // ================== BIGINT & DATE FIX STARTS HERE ==================
  convertRecursively = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // IMPORTANT: Check for Date objects and return them directly
    // This must come BEFORE the generic 'object' check.
    if (obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertRecursively(item));
    }

    if (typeof obj === 'object') {
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (typeof value === 'bigint') {
            newObj[key] = value.toString();
          } else {
            // Recurse on the value
            newObj[key] = this.convertRecursively(value);
          }
        }
      }
      return newObj;
    }

    return obj;
  };

  async create(createOpenaiDto: RequestBodyOpenaiDto, user_id: string) {
    const systemPrompt = this.chatGptDescribe.replaceAll(
      '{{ user_id }}',
      user_id,
    );
    const completion = await this.openai.chat.completions.create({
      model: 'o4-mini-2025-04-16', // Or 'gpt-3.5-turbo' for a faster, cheaper option
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: createOpenaiDto.prompt },
      ],
    });
    const queryText = completion.choices[0].message.content.trim();
    // // ... (your AI and query generation logic remains the same)
    // const chatgpt = this.chatGptDescribe.replaceAll('{{ user_id }}', user_id);
    // const result = await this.genAiProModel.generateContent([
    //   chatgpt,
    //   createOpenaiDto?.prompt,
    // ]);
    // const response = await result?.response;
    const text = queryText;
    const singleLineQuery = text;

    const rawResult: any[] =
      await this.prismaServe.$queryRawUnsafe(singleLineQuery);

    const serializableResult = this.convertRecursively(rawResult);
    // =================== BIGINT & DATE FIX ENDS HERE ===================

    return {
      query: singleLineQuery,
      result: serializableResult, // This will now work correctly
      prompt: createOpenaiDto?.prompt,
    };
  }

  async createGraph(createOpenaiDto: RequestBodyOpenaiDto, user_id: string) {
    const { query, result } = await this.create(createOpenaiDto, user_id);
    const systemPrompt = this.chartDataDescribe
      .replaceAll('{{ user_request_prompt }}', createOpenaiDto.prompt)
      .replaceAll('{{ generated_data }}', JSON.stringify(result));
    // const graphGenPrompt = this.chartDataDescribe.replaceAll(
    //   '{{ user_request_prompt }}',
    //   createOpenaiDto?.prompt,
    // );
    // const graphResulted = graphGenPrompt.replaceAll(
    //   '{{ generated_data }}',
    //   JSON.stringify(resulta?.result),
    // );

    const completion = await this.openai.chat.completions.create({
      model: 'o4-mini-2025-04-16', // Using a powerful model for better JSON structuring
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            'Generate the graph JSON for the data provided in the system prompt.',
        },
      ],
      // Use OpenAI's built-in JSON mode for reliable JSON output
      response_format: { type: 'json_object' },
    });
    const graphJsonString = completion.choices[0].message.content;
    const graphData = JSON.parse(graphJsonString);
    return {
      query,
      prompt: createOpenaiDto?.prompt,
      graphData,
    };
  }

  // async getChatWithOpenAI(
  //   user_id: string,
  //   createOpenaiDto: RequestBodyOpenaiDto[],
  // ) {
  //   const schema = fs.readFileSync('./prisma/schema.prisma', 'utf8');
  //   const messages = `Prisma.js Schema is: ${schema}. i want to do a chat with you for {prompt}. respond if you require any other information frome me. if you need any other information from me then please ask me for that. OR if you want to know about any other thing then please ask me for that. once you get all the information then please RESPOND only with SQL QUERY for POSTGRESQL DB OR respond what you need. i want to create the record only for the user with ID: ${user_id}`;

  //   const result = await this.genAiProModel.startChat({
  //     history: [
  //       {
  //         role: 'user',
  //         parts: [{ text: 'Hello' }],
  //       },
  //       {
  //         role: 'model',
  //         parts: [
  //           {
  //             text: 'Hello, may I know how can I help you today',
  //           },
  //         ],
  //       },
  //       {
  //         role: 'user',
  //         parts: [
  //           { text: messages?.replace('{prompt}', createOpenaiDto[0]?.prompt) },
  //         ],
  //       },
  //     ],
  //   });

  //   const msg = `i want to create a product with the following details:
  //   name: "Product Name",
  //   description: "Product Description",
  //   price: 100,
  //   user_id: ${user_id},
  //   type: Service,
  //   currencies: INR,
  //   unit: MONDD`;
  //   const resulta = await result?.sendMessage(msg);
  //   const response = await resulta?.response;
  //   const text = response?.text();
  //   const checkisSQL = text?.includes('```sql');
  //   if (checkisSQL) {
  //     const querySplit = text.split('```sql')[1].split('```')[0];
  //     const singleLineQuery = querySplit.replace(/\s+/g, ' ').trim();
  //     const resulta = await this.prismaServe.$queryRawUnsafe(singleLineQuery);
  //     return resulta;
  //   }
  //   return text;
  // }

  /**
   * Proxy chat endpoint for Your AI. Builds messages, optionally attaches images
   * to the last user message, and returns OpenAI reply.
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    imageBase64?: string[],
  ): Promise<{ content: string }> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const isLastUserMessage =
        msg.role === 'user' && i === messages.length - 1 && imageBase64?.length;

      if (isLastUserMessage) {
        const parts: Array<
          | { type: 'text'; text: string }
          | { type: 'image_url'; image_url: { url: string } }
        > = [
          {
            type: 'text',
            text: msg.content || 'What do you see in these images?',
          },
        ];
        for (const b64 of imageBase64) {
          const mime = b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
          parts.push({
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${b64}` },
          });
        }
        openaiMessages.push({ role: 'user', content: parts });
      } else {
        openaiMessages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        });
      }
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    return { content };
  }

  private readonly EXTRACT_INVOICE_SYSTEM_PROMPT = `You are an invoice data extractor. Given an image of an invoice or receipt, extract structured data as a single JSON object.
Return ONLY valid JSON, no markdown or explanation. Use this exact structure:
{
  "bill_to": {
    "name": "string (required - the customer/recipient the invoice is TO, i.e. Bill To)",
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null",
    "city": "string or null",
    "state": "string or null",
    "zip": "string or null",
    "country_name": "string or null"
  },
  "from": {
    "name": "string or null (the seller/issuer - Bill From; do not use for customer)"
  },
  "invoice_number": "string or null",
  "date": "YYYY-MM-DD or null",
  "due_date": "YYYY-MM-DD or null",
  "line_items": [
    { "description": "string", "quantity": number, "unit_price": number, "total": number }
  ],
  "subtotal": number or null,
  "total": number or null,
  "tax_amount": number or null,
  "currency_code": "string or null (e.g. USD, EUR)",
  "notes": "string or null (any notes or terms from the invoice)"
}
IMPORTANT: bill_to = the party receiving the invoice (customer we will create). from = the seller/issuer (do not use for customer). If the invoice only has one party, put the recipient in bill_to. For line_items, extract every item/row. Ensure totals and amounts are numbers.`;

  /**
   * Extract invoice/receipt data from images. Returns structured data for
   * pre-filling invoice/expense forms.
   */
  async extractInvoice(imageBase64: string[]): Promise<ExtractInvoiceResponse> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }

    const content: Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    > = [
      {
        type: 'text',
        text: 'Extract all invoice data from this image. Return only the JSON object.',
      },
    ];
    for (const b64 of imageBase64) {
      const mime = b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      content.push({
        type: 'image_url',
        image_url: { url: `data:${mime};base64,${b64}` },
      });
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: this.EXTRACT_INVOICE_SYSTEM_PROMPT },
        { role: 'user', content },
      ],
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error('AI did not return valid JSON. Please try again.');
    }

    return this.mapExtractionToResponse(parsed);
  }

  private mapExtractionToResponse(
    obj: Record<string, unknown>,
  ): ExtractInvoiceResponse {
    const billTo = obj.bill_to as Record<string, unknown> | undefined;
    const legacyCustomer = obj.customer as Record<string, unknown> | undefined;
    const cust = billTo ?? legacyCustomer ?? {};

    const customer = {
      name: typeof cust.name === 'string' ? cust.name : 'Imported Customer',
      email: typeof cust.email === 'string' ? cust.email : null,
      phone: typeof cust.phone === 'string' ? cust.phone : null,
      address: typeof cust.address === 'string' ? cust.address : null,
      city: typeof cust.city === 'string' ? cust.city : null,
      state: typeof cust.state === 'string' ? cust.state : null,
      zip: typeof cust.zip === 'string' ? cust.zip : null,
      country_name:
        typeof cust.country_name === 'string' ? cust.country_name : null,
    };

    const rawLineItems = Array.isArray(obj.line_items) ? obj.line_items : [];
    const line_items = rawLineItems.map((item: unknown) => {
      const i = item as Record<string, unknown>;
      const desc = typeof i.description === 'string' ? i.description : 'Item';
      const qty = typeof i.quantity === 'number' ? i.quantity : 1;
      const up = typeof i.unit_price === 'number' ? i.unit_price : 0;
      const tot = typeof i.total === 'number' ? i.total : up * qty;
      return {
        description: desc,
        quantity: qty,
        unit_price: up,
        total: tot,
      };
    });

    return {
      customer,
      invoice_number:
        typeof obj.invoice_number === 'string' ? obj.invoice_number : null,
      date: typeof obj.date === 'string' ? obj.date : null,
      due_date: typeof obj.due_date === 'string' ? obj.due_date : null,
      line_items,
      subtotal: typeof obj.subtotal === 'number' ? obj.subtotal : null,
      total: typeof obj.total === 'number' ? obj.total : null,
      tax_amount: typeof obj.tax_amount === 'number' ? obj.tax_amount : null,
      currency_code:
        typeof obj.currency_code === 'string' ? obj.currency_code : null,
      notes: typeof obj.notes === 'string' ? obj.notes : null,
    };
  }

  async getChatWithOpenAIForDashboard(dashboard_id: string) {
    const dashboardData = await this.dashboardService.findOne(dashboard_id);
    const resulta = await this.prismaServe.$queryRawUnsafe(
      dashboardData?.query,
    );
    if (dashboardData?.type === 'Table') {
      return this.convertRecursively(resulta);
    } else {
      const graphGenPrompt = this.chartDataDescribe.replaceAll(
        '{{ user_request_prompt }}',
        dashboardData?.prompt,
      );
      const graphResulted = graphGenPrompt.replaceAll(
        '{{ generated_data }}',
        JSON.stringify(resulta),
      );

      const graphResult = await this.genAiProJsonModel.generateContent([
        graphResulted,
        dashboardData?.prompt,
      ]);
      const graphResponse = await graphResult?.response;
      const graphText = graphResponse?.text();
      const graphSplit = graphText?.startsWith('```json')
        ? graphText.split('```json')[1].split('```')[0]
        : graphText;
      const graphData = JSON.parse(graphSplit);
      return graphData;
    }
  }
}
