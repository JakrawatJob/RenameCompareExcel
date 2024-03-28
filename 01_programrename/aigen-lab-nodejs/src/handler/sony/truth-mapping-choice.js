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
      const Amounts = [];
      const Units = [];
      let itemSum = 10;
      for (let i = 1; i <= 10; i++) {
        const amount = _.get(jsonFromExcel, `Sheet1.[${i}].F`);
        const unit = _.get(jsonFromExcel, `Sheet1.[${i}].E`);
        if (amount === '' && unit === '') {
          itemSum = i - 1;
          break;
        }
        if (i <= 3) {
          Amounts.push(parseFloat(amount));
          Units.push(parseFloat(unit));
        }
      }
      const truthFiles = fs.readdirSync(`${truthDir}/${dir}`);

      truthFiles.find((tf, i) => {
        console.log('tf', tf);
        const pathToWork = `${truthDir}/${dir}/${tf}`;

        const truthJsonExcel = excelToJson({
          source: fs.readFileSync(pathToWork), // fs.readFileSync return a Buffer
        });

        const truthInvoiceNo = _.get(truthJsonExcel, `Sheet1.[1].A`);
        const truthAmounts = [];
        const truthUnits = [];
        let truthitemSum = 10;
        for (let i = 1; i <= 10; i++) {
          const amount = _.get(truthJsonExcel, `Sheet1.[${i}].F`);
          const unit = _.get(truthJsonExcel, `Sheet1.[${i}].E`);
          if (amount === '' && unit === '') {
            truthitemSum = i - 1;
            break;
          }
          if (i <= 3) {
            truthAmounts.push(parseFloat(amount));
            truthUnits.push(parseFloat(unit));
          }
        }
        const case1 = invoiceNo === truthInvoiceNo;
        const case2 = truthAmounts.every(
          (amount, index) => amount === Amounts[index]
        );
        const case3 =
          truthAmounts[0] === Amounts[0] &&
          truthAmounts[1] === Amounts[1] &&
          truthUnits[0] === Units[0] &&
          truthUnits[1] === Units[1];
        const case4 =
          truthAmounts[0] === Amounts[0] &&
          truthUnits[0] === Units[0] &&
          truthitemSum === itemSum;
        console.log(case1, case2, case3, case4);
        if (case1 || case2 || case3 || case4) {
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
