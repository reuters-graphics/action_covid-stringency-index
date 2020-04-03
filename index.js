const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('node-xlsx');
const d3 = Object.assign({}, require('d3-collection'));

//
const publishJson = require('./lib/publishJson');
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

  const groupByCountry = d3
    .nest()
    .key((d) => d.countryName)
    .entries(simplified);

  writeJSONLocally(
    groupByCountry,
    path.resolve(__dirname, 'data/latest_parsed.json')
  );

  await publishJson(groupByCountry, 'TKTKTK.json');
};

const writeJSONLocally = (data, location) =>
  fs.writeFileSync(location, JSON.stringify(data, 4));

const run = async () => {
  await downloadLatestXLSX();
  await parseXLSX();
};

run();
