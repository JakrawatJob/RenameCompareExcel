const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
let excelFolder = "01_Exceltojson";
let jsonFolder = "";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("Press 1 to append '_OCR'");
console.log("Press 2 to append '_Truth'");

rl.question("Enter your choice: ", (choice) => {
  rl.close();
  if (choice == "1") {
    excelFolder = "01_Exceltojson";
    jsonFolder = "03_JsonExcelformat";
  }
  if (choice == "2") {
    excelFolder = "02_ExceltoJsonTruth";
    jsonFolder = "03_JsonExcelformatTruth";
  }
  const folderFiles = fs.readdirSync(excelFolder);

  folderFiles.forEach((folder) => {
    const folderPath = path.join(excelFolder, folder);
    const excelFiles = fs.readdirSync(folderPath);
    const appendValue =
      choice === "1" ? "_OCR" : choice === "2" ? "_Truth" : "";

    if (appendValue === "") {
      console.log("Invalid input. Please press 1 or 2.");
      process.exit(1);
    }

    excelFiles.forEach((file) => {
      const workbook = XLSX.readFile(`${excelFolder}/${folder}/${file}`);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const filteredData = jsonData;
      const outputFileName = file.replace(".xlsx", `${appendValue}.json`);
      const targetFolderPath = path.join(jsonFolder, folder);
      fs.mkdirSync(targetFolderPath, { recursive: true });
      fs.writeFileSync(
        `${jsonFolder}/${folder}/${outputFileName}`,
        JSON.stringify(filteredData, null, 2)
      );
    });

    console.log(
      "All Excel files converted to JSON successfully in 'JsonTruth' folder."
    );
  });
});
