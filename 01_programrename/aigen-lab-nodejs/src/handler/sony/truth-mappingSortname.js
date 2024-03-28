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
      const numberPageResult = file.match(/\d+/);
      const jsonFromExcel = excelToJson({
        source: fs.readFileSync(`${resultDir}/${dir}/${file}`), // fs.readFileSync return a Buffer
      });

      const sheetKey = Object.keys(jsonFromExcel);
      const invoiceNo = _.get(jsonFromExcel, `${sheetKey}.[1].A`);

      const truthFiles = fs.readdirSync(`${truthDir}/${dir}`);
      let checkDataMap = false;
      let pathToWorkNum = '';
      truthFiles.find((tf, i) => {
        const pathToWork = `${truthDir}/${dir}/${tf}`;
        const numberPageTruth = tf.match(/\d+/);
        console.log('tf', tf, numberPageTruth[0]);
        const truthJsonExcel = excelToJson({
          source: fs.readFileSync(pathToWork), // fs.readFileSync return a Buffer
        });

        const truthInvoiceNo = _.get(truthJsonExcel, `Sheet1.[1].A`);

        if (invoiceNo === truthInvoiceNo) {
          checkDataMap = false;
          const regex = /_STA|_STBIWH|_STBOWH|_STC/;
          const newFilename = file.replace(regex, '');
          console.log(newFilename);
          fs.cpSync(pathToWork, `${rootDir}/truth_order/${dir}/${newFilename}`);
          return true;
        }
        console.log(numberPageResult[0], numberPageTruth[0], checkDataMap);
        if (numberPageResult[0] === numberPageTruth[0]) {
          console.log(numberPageResult[0], numberPageTruth[0], checkDataMap);
          pathToWorkNum = pathToWork;
          checkDataMap = true;
        }
      });
      if (checkDataMap) {
        checkDataMap = false;
        const regex = /_STA|_STBIWH|_STBOWH|_STC/;
        const newFilename = file.replace(regex, '');
        console.log(newFilename);
        fs.cpSync(
          pathToWorkNum,
          `${rootDir}/truth_order/${dir}/${newFilename}`
        );
      }
    });
  });

  return 'xx';
};
