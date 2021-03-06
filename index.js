const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('node-xlsx');
const d3 = Object.assign({}, require('d3-collection'));

//
const publishJson = require('./lib/publishJSON.js');
const sanitiseDate = require('./lib/cleanDates.js');

const SOURCE_PATH = path.resolve(__dirname, 'data/latest.xlsx');

async function downloadLatestXLSX() {
  const xlsx_path_latest =
    'https://www.bsg.ox.ac.uk/sites/default/files/OxCGRT_Download_latest_data.xlsx';
  const writer = fs.createWriteStream(SOURCE_PATH);

  const response = await axios({
    url: xlsx_path_latest,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

const parseXLSX = async () => {
  const parsedExcel = xlsx.parse(SOURCE_PATH)[0].data;

  // simplify data. keep country name, 3-char ISO code,
  // report date, and stringency index value
  const simplified = parsedExcel
    .map((e) => {
      return {
        countryName: e[0],
        countryISO: e[1],
        date: sanitiseDate(e[2]),
        index: parseInt(e[e.length - 2]),
      };
    })
    .filter((e) => e.countryName !== 'CountryName');

  const uniqueDates = [...new Set(simplified.map((e) => e.date))];

  const data = { series: uniqueDates, data: {} };

  const groupByCountry = d3
    .nest()
    .key((d) => d.countryName)
    .entries(simplified);

  for (let i = 0; i < groupByCountry.length; i++) {
    const country = groupByCountry[i].key;
    const countryData = groupByCountry[i].values;

    const simpleCountryData = data.series.map((e) => {
      const match = countryData.find((d) => d.date === e);
      if (match) {
        return match.index;
      }
    });
    data.data[country] = simpleCountryData;
  }

  writeJSONLocally(data, path.resolve(__dirname, 'data/latest_parsed.json'));

  await publishJson(data, 'latest.json');
};

const writeJSONLocally = (data, location) =>
  fs.writeFileSync(location, JSON.stringify(data, 4));

const run = async () => {
  await downloadLatestXLSX();
  await parseXLSX();
};

run();
