import consMenu from "./consMenu.mjs";
import fs from "fs";
import path from "path";
import configuration from "../../configuration.mjs";

export default (fullPath, EXTENSION = "csv") => {
  const files = fs.readdirSync(fullPath);
  const csvFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === "." + EXTENSION.toLowerCase()
  );
  const csvTimed = csvFiles.map((fname) => {
    const fileInfo = fs.statSync(path.join(fullPath, fname));
    return { name: fname, created: fileInfo.birthtime.toISOString() };
  });

  csvTimed.sort((f1, f2) =>
    f1.created > f2.created ? -1 : f1.created < f2.created ? 1 : 0
  );

  console.log(`[Active DB: ${configuration.DB_DATAFILE}]`);
  console.log("Select file: ");
  //const theFileNo = consMenu(csvTimed.map((e) => `${e.name}\t${e.created}`));
  const theFileNo = consMenu(csvTimed);

  return theFileNo >= 0
    ? path.join(fullPath, csvTimed[theFileNo].name)
    : undefined;
};
