const fs = require("fs");
const path = require("path");

const foldersToDeleteFrom = [
  "01_Exceltojson",
  "02_ExceltoJsonTruth",
  "03_JsonExcelformat",
  "03_JsonExcelformatTruth",
];

foldersToDeleteFrom.forEach((folderPath) => {
  const targets = fs.readdirSync(folderPath);

  targets.forEach((target) => {
    const targetPath = path.join(folderPath, target);
    const stats = fs.statSync(targetPath);

    if (stats.isFile()) {
      fs.unlinkSync(targetPath);
      console.log(`File ${targetPath} has been deleted.`);
    } else if (stats.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true });
      console.log(`Directory ${targetPath} has been deleted.`);
    }
  });
});
