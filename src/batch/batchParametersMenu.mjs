import readLineSync from "readline-sync";
import { BatchDescription } from "./BatchDescription.mjs";

export function batchParametersMenu(batchName) {
  let batchDB;
  if (batchName) {
    batchDB = BatchDescription.restoreFromDB(batchName);
  } else {
    batchName = readLineSync.question("Batch name: ");
    batchDB = new BatchDescription(
      batchName,
      "",
      0,
      10,
      "RingCentral",
      "RC",
      "Legacy",
      [],
      false,
      0,
      0,
      false,
      2000
    );
  }

  let description =
    readLineSync.question(`Description [${batchDB.description}]: `) ||
    batchDB.description;
  let accSizeMin =
    readLineSync.question(`Account Size Min [${batchDB.accSizeMin}]: `) ||
    batchDB.accSizeMin;
  let accSizeMax =
    readLineSync.question(`Account Size Max [${batchDB.accSizeMax}]: `) ||
    batchDB.accSizeMax;
  let brand = readLineSync.question(
    `Brand(1=RingCentral, 2=RingCentral Canada, 3=1+2) [${
      batchDB.brand || 3
    }]: `
  );
  let telcoProvider = readLineSync.question(
    `telcoProvider(1=RC, 2=NiC,3=1+2)[${batchDB.telcoProvider || 3}]: `
  );
  let seatEdition = readLineSync.question(
    `Seat Edition Generation(1=Legacy, 2=NewGeneration, 3=1+2)[${
      batchDB.seatEdition || 3
    }]: `
  );
  let accountList = readLineSync
    .question(
      `Specific accounts, comma separated. ("x" to clear): [${batchDB.accountList}]: `
    )
    .trim();
  let casesMin =
    readLineSync.question(`Min Number of cases [${batchDB.casesMin}]: `) ||
    batchDB.casesMin;
  let casesMax =
    readLineSync.question(`Max Number of cases [${batchDB.casesMax}]: `) ||
    batchDB.casesMax;
  let casesNBU =
    readLineSync.question(
      `Having NBU case [${batchDB.casesNBU ? "Y" : "N"}]: `
    ) || batchDB.casesNBU
      ? "Y"
      : "N";
  let maxSize =
    readLineSync.question(`Max number of accounts [${batchDB.maxSize}]: `) ||
    batchDB.maxSize;

  return new BatchDescription(
    batchName,
    description,
    accSizeMin,
    accSizeMax,
    brand === "1"
      ? "RingCentral"
      : brand === "2"
      ? "RingCentral Canada"
      : brand === "3"
      ? undefined
      : batchDB.brand,
    telcoProvider === "1"
      ? "RC"
      : telcoProvider === "2"
      ? "NiC"
      : telcoProvider === "3"
      ? undefined
      : batchDB.telcoProvider,
    seatEdition === "1"
      ? "Legacy"
      : seatEdition === "2"
      ? "NewGeneration"
      : seatEdition === "3"
      ? undefined
      : batchDB.seatEdition,
    accountList === "x"
      ? []
      : accountList.length > 0
      ? accountList.split(",")
      : batchDB.accountList,
    true,
    casesMin,
    casesMax,
    casesNBU === "Y",
    maxSize
  );
}
