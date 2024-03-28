const fs = require('fs');
const _ = require('lodash');
const excelToJson = require('convert-excel-to-json');

const rootDir = '../sonyfilename'; //sonyrenameprogram/sonyfilename

exports.handler = async (event, context) => {
  const resultDir = `${rootDir}/results`;
  const truthDir = `${rootDir}/truth`;

  const dirs = fs.readdirSync(resultDir);

  dirs.forEach((dir) => {
    console.log(dir);

    const files = fs.readdirSync(`${resultDir}/${dir}`);

    files.forEach((file) => {
      console.log('check', file);
      const jsonFromExcel = excelToJson({
        source: fs.readFileSync(`${resultDir}/${dir}/${file}`), // fs.readFileSync return a Buffer
      });

      const sheetKey = Object.keys(jsonFromExcel);
      const invoiceNo = _.get(jsonFromExcel, `${sheetKey}.[1].A`);

      const truthFiles = fs.readdirSync(`${truthDir}/${dir}`);

      truthFiles.find((tf, i) => {
        console.log('tf', tf);
        const pathToWork = `${truthDir}/${dir}/${tf}`;

        const truthJsonExcel = excelToJson({
          source: fs.readFileSync(pathToWork), // fs.readFileSync return a Buffer
        });

        const truthInvoiceNo = _.get(truthJsonExcel, `Sheet1.[1].A`);

        if (invoiceNo === truthInvoiceNo) {
          const regex = /_STA|_STBIWH|_STBOWH|_STC/;
          const newFilename = file.replace(regex, '');
          console.log(newFilename);
          fs.cpSync(pathToWork, `${rootDir}/truth_order/${dir}/${newFilename}`);
          return true;
        }
      });
    });
  });

  return 'xx';
};
