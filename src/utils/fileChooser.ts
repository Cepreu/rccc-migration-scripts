import consMenu from "./consMenu.js";
import fs from "fs";
import path from "path";
import configuration from "../../configuration.js";

export default (fullPath: string, extension = "csv"): string | undefined => {
  const files = fs.readdirSync(fullPath);
  const csvFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === "." + extension.toLowerCase()
  );
  const csvTimed = csvFiles.map((fname) => {
    const fileInfo = fs.statSync(path.join(fullPath, fname));
    return { name: fname, created: fileInfo.birthtime.toISOString() };
  });

  csvTimed.sort((f1, f2) =>
    f1.created > f2.created ? -1 : f1.created < f2.created ? 1 : 0
  );

  if (csvTimed.length === 0) {
    console.warn(`No .${extension} files found in ${fullPath}`);
    return undefined;
  }

  console.log(`[Active DB: ${configuration.DB_DATAFILE}]`);
  console.log("Select file: ");
  //const theFileNo = consMenu(csvTimed.map((e) => `${e.name}\t${e.created}`));
  const theFileNo = consMenu(csvTimed);

  return theFileNo !== undefined
    ? path.join(fullPath, csvTimed[theFileNo].name)
    : undefined;
};
