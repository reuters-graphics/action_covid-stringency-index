const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('node-xlsx');
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
  console.log(parsedExcel.map((e) => e[0]));

  // simplify data. keep country name, 3-char ISO code,
  // report date, and stringency index value
  const simplified = parsedExcel.map((e) => {
    return {
      countryName: e[0],
      countryISO: e[1],
      date: sanitiseDate(e[2]),
      index: e[e.length - 2],
    };
  });
  console.log(simplified);
};

const run = async () => {
  // await downloadLatestXLSX();
  await parseXLSX();
};

run();
