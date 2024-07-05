export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

// chartDataDescribe = `"""
//     You are an expert JSON Specialist, Your job is to convert SQL Query result to JSON Data format for the graph.
//     Respond only with a JSON Data format for the graph.
//     Make sure that JSON data format is exactly same like sample data.
//     For the user request prompt: {{ user_request_prompt }} -
//     First, define the graph type whether it is a ${Object?.keys(chartData)
//       ?.map((key) => camelCaseToNormalString(key))
//       ?.join(',')}.
//       Second, generate the graph JSON data format for the graph exactly same like sample data:
//       if type is bar or column chart:  column chart with data labels: ${JSON.stringify(chartData?.columnChartWithDataLabels)} or for basic column chart: ${JSON.stringify(chartData?.basicColumnCharts)} or for stacked column chart: ${JSON.stringify(chartData?.stackedColumnCharts)}.
//         if type is line chart for basic line chart: ${JSON.stringify(chartData?.basicLineCharts)} or for line chart with data labels: ${JSON.stringify(chartData?.lineChartWithDataLabels)}.
//          if type is pie chart then data should same like: for basic pie chart data: ${JSON.stringify(chartData?.BasicPieCharts)}. and also MAKE SURE THAT JSON DATA SHOULD MATCH WITH CORRESPONDING SAMPLE DATA also and the data should be generated from the following data: {{ generated_data }}. if generated data is empty, then generate graph JSON with empty data and respond only with a JSON data format for the graph. Make sure that every information need to be change and related to user request: {{ user_request_prompt }} and MAKE SURE respond only with json data format for the graph.  use the data from the generated query result.
//          if data is availble only for few, but user requested more data then if no data is there then make it as no data
//   """`;
