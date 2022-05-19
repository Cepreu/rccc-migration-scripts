import readLineSync from "readline-sync";
import { Entitlements_DWH } from "./Entitlements_DWH.mjs";
import { Invoices, InvoiceLines } from "./invoices.mjs";
import { RCMRCSummary } from "./RCMRCSummary.mjs";
import { CatalogNGBS, CatalogSFDC } from "./Catalog.mjs";
import { Entitlements_SFDC } from "./Entitlements_SFDC.mjs";

console.log("1) Entitlements");
console.log("2) Invoices");
console.log("3) RCMRCSummary");
console.log("4) Catalog");
console.log("5) Entitlements SFDC");
console.log("6) Entitlements DWH");

const userRes = readLineSync.question("Pick an option: ");
if (userRes === "1") {
  EntitlementsLOG();
} else if (userRes === "2") {
  Invoices();
  InvoiceLines();
} else if (userRes === "3") {
  RCMRCSummary();
} else if (userRes === "4") {
  CatalogNGBS();
  CatalogSFDC();
} else if (userRes === "5") {
  Entitlements_SFDC();
} else if (userRes === "6") {
  Entitlements_DWH();
}
console.log("G'buy");
