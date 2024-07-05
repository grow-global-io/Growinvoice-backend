import axios from 'axios';

export const convertLogoToBase64 = async (logo: string) => {
  if (logo) {
    const image = await axios.get(logo, {
      responseType: 'arraybuffer',
    });
    const base64Image = Buffer.from(image.data, 'binary').toString('base64');
    return `data:image/webp;base64,${base64Image}`;
  }
  return logo;
};

export function camelCaseToNormalString(camelCase: string): string {
  // Use a regular expression to insert spaces before each uppercase letter
  const normalString = camelCase.replace(/([A-Z])/g, ' $1');
  // Convert the entire string to lowercase and trim any leading spaces
  return normalString.toLowerCase().trim();
}

const columnChartWithDataLabels = {
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

const basicColumnCharts = {
  series: [
    {
      name: 'Net Profit',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
    },
    {
      name: 'Revenue',
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
    },
    {
      name: 'Free Cash Flow',
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
    },
  ],
  options: {
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
      ],
    },
    yaxis: {
      title: {
        text: '$ (thousands)',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return '$ ' + val + ' thousands';
        },
      },
    },
  },
};

const stackedColumnCharts = {
  series: [
    {
      name: 'PRODUCT A',
      data: [44, 55, 41, 67, 22, 43],
    },
    {
      name: 'PRODUCT B',
      data: [13, 23, 20, 8, 13, 27],
    },
    {
      name: 'PRODUCT C',
      data: [11, 17, 15, 15, 21, 14],
    },
    {
      name: 'PRODUCT D',
      data: [21, 7, 25, 13, 22, 8],
    },
  ],
  options: {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        borderRadiusApplication: 'end', // 'around', 'end'
        borderRadiusWhenStacked: 'last', // 'all', 'last'
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900,
            },
          },
        },
      },
    },
    xaxis: {
      type: 'datetime',
      categories: [
        '01/01/2011 GMT',
        '01/02/2011 GMT',
        '01/03/2011 GMT',
        '01/04/2011 GMT',
        '01/05/2011 GMT',
        '01/06/2011 GMT',
      ],
    },
    legend: {
      position: 'right',
      offsetY: 40,
    },
    fill: {
      opacity: 1,
    },
  },
};

const basicLineCharts = {
  series: [
    {
      name: 'Desktops',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
    },
  ],
  options: {
    chart: {
      height: 350,
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'straight',
    },
    title: {
      text: 'Product Trends by Month',
      align: 'left',
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
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
      ],
    },
  },
};

const lineChartWithDataLabels = {
  series: [
    {
      name: 'High - 2013',
      data: [28, 29, 33, 36, 32, 32, 33],
    },
    {
      name: 'Low - 2013',
      data: [12, 11, 14, 18, 17, 13, 13],
    },
  ],
  options: {
    chart: {
      height: 350,
      type: 'line',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2,
      },
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ['#77B6EA', '#545454'],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: 'Average High & Low Temperature',
      align: 'left',
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    markers: {
      size: 1,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      title: {
        text: 'Month',
      },
    },
    yaxis: {
      title: {
        text: 'Temperature',
      },
      min: 5,
      max: 40,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  },
};

const BasicPieCharts = {
  series: [44, 55, 13, 43, 22],
  options: {
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  },
};

export const chartData = {
  columnChartWithDataLabels,
  basicColumnCharts,
  stackedColumnCharts,
  basicLineCharts,
  lineChartWithDataLabels,
  BasicPieCharts,
};

// const messages = `I have a Prisma.js Schema that you can read below: ${schema} and Write an SQL Query that will satisfy question: ${createOpenaiDto?.prompt} Respond only with an SQL Query for PostgreSQL that will satisfy the question. Make sure that SQL query is only for PostgreSQL db and table name should be in double quotes and table name should be same like in schema(make sure with capital letters). and if question is related to BigInt or Count then count result is cast to a text(like: CAST(count(*) AS TEXT)). The query should be specific to the user with ID: ${user_id}. even question is related to other user's data but query should be specific to the user with ID: ${user_id} only. Make sure that the query is safe and secure. Make sure that count result is cast to a text(like: CAST(count(*) AS TEXT)). if USER request is related to date or month or year then Make sure to use format also`;
//  const graphGenPrompt = `i want to generate a graph json data format. for the user request prompt: ${createOpenaiDto?.prompt} - First, define the graph type whether it is a ${Object?.keys(
//    chartData,
//  )
//    ?.map((key) => camelCaseToNormalString(key))
//    ?.join(
//      ',',
//  )}. Second, generate the graph JSON data format for the graph exactly same like sample data: if type if bar or column chart:  column chart with data labels: ${JSON.stringify(chartData?.columnChartWithDataLabels)} and for basic column chart: ${JSON.stringify(chartData?.basicColumnCharts)} and for stacked column chart: ${JSON.stringify(chartData?.stackedColumnCharts)}, if type is line chart:  for basic line chart: ${JSON.stringify(chartData?.basicLineCharts)} and for line chart with data labels: ${JSON.stringify(chartData?.lineChartWithDataLabels)}, if type is pie chart then data should same like: for basic pie chart data: ${JSON.stringify(chartData?.BasicPieCharts)}. and also MAKE SURE THAT JSON DATA SHOULD MATCH WITH CORRESPONDING SAMPLE DATA also and the data should be generated from the following data: ${JSON.stringify(resulta)}. if generated data is empty, then generate graph JSON with empty data and respond only with a JSON data format for the graph. Make sure that every information need to be change and related to user request: ${createOpenaiDto?.prompt} and MAKE SURE respond only with json data format for the graph. MAKE SURE DONOT USE Dummy data. use the data from the generated query result.`;
