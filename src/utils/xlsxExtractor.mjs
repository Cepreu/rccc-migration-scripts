import { XLSX } from "xlsx-extract";

export default (xlsxFile, tabName, onEndHandler) => {
  const ftype = "xlsx";
  const csvFile =
    xlsxFile.substring(0, xlsxFile.length - ftype.length - 1) +
    "_" +
    tabName +
    ".csv";
  new XLSX()
    .convert(xlsxFile, csvFile, { sheet_name: tabName, tsv_delimiter: "," })
    .on("error", function (err) {
      console.error(err);
    })
    .on("end", function () {
      console.log("written " + csvFile);
      onEndHandler(csvFile);
    });
};
