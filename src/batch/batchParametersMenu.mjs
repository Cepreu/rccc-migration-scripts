import { BatchDescription } from "./BatchDescription.mjs";
import {
  textReader,
  arrayReader,
  boolReader,
  amountReader,
  intReader,
  optioner,
} from "../utils/userInputHelper.mjs";

export function batchParametersMenu(batchName) {
  let batchDB;
  if (batchName) {
    batchDB = BatchDescription.restoreFromDB(batchName);
  } else {
    batchName = readLineSync.question("Batch name: ");
    batchDB = new BatchDescription({
      name: batchName,
      saveFlag: true,
    });
  }

  let description = textReader("Description", batchDB.description);
  let accSizeMin = intReader("Account Size Min", batchDB.accSizeMin);
  let accSizeMax = intReader(
    "Account Size Max",
    batchDB.accSizeMax,
    accSizeMin
  );
  let brand = optioner(
    "Brand",
    ["RingCentral", "RingCentral Canada", "Any"],
    batchDB.brand
  );
  let telcoProvider = optioner(
    "telcoProvider",
    ["RC", "NiC", "Any"],
    batchDB.telcoProvider
  );
  let seatEdition = optioner(
    "Seat Edition Generation",
    ["Legacy", "NewGeneration", "Any"],
    batchDB.seatEdition
  );
  let accountList = arrayReader("Specific accounts", batchDB.accountList);
  let casesMin = intReader("Min Number of cases", batchDB.casesMin);
  let casesMax = intReader("Max Number of cases", batchDB.casesMax, casesMin);
  let casesNBU = boolReader("Having NBU case", batchDB.casesNBU);
  let maxSize = intReader("Max number of accounts", batchDB.maxSize);
  let maxContactCenterMRR = amountReader(
    "Max Contact Center MRR",
    batchDB.maxContactCenterMRR
  );
  let maxTotalMRR = amountReader("Max total MRR", batchDB.maxTotalMRR);
  let PaymentPlan = optioner(
    "Payment Plan",
    ["Monthly", "Annual", "Any"],
    batchDB.PaymentPlan
  );
  let AccountPaymentMethod = optioner(
    "Payment Method",
    ["Invoice", "Credit Card", "Any"],
    batchDB.AccountPaymentMethod
  );

  return new BatchDescription({
    name: batchName,
    description,
    accSizeMin,
    accSizeMax,
    brand,
    telcoProvider,
    seatEdition,
    accountList,
    casesMin,
    casesMax,
    casesNBU,
    maxSize,
    maxContactCenterMRR,
    maxTotalMRR,
    PaymentPlan,
    AccountPaymentMethod,
  });
}
