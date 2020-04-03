const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('node-xlsx');

// const workSheetsFromFile = (`${__dirname}/OxCGRT_Download_latest_data.xlsx`);

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
    console.log(parsedExcel);
};

const run = async () => {
    await downloadLatestXLSX();
    await parseXLSX();
};

run();
