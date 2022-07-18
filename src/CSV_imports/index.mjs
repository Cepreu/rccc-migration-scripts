import consMenu from "../utils/consMenu.mjs";
import { Entitlements_DWH } from "./Entitlements_DWH.mjs";
import { Invoices, InvoiceLines } from "./invoices.mjs";
import { RCMRCSummary } from "./RCMRCSummary.mjs";
import { CatalogNGBS, CatalogSFDC } from "./Catalog.mjs";
import { importAccountReport } from "./Accounts_SFDC.mjs";
import { importCaseReport } from "./case2cases_SFDC.mjs";

const userRes = consMenu(
  [
    "Entitlements",
    "Invoices",
    "RCMRCSummary",
    "Catalog",
    "Account Report SFDC",
    "Entitlements DWH",
    "Case2Case",
  ],
  true
);

if (userRes === 0) {
  EntitlementsLOG();
} else if (userRes === 1) {
  Invoices();
  InvoiceLines();
} else if (userRes === 2) {
  RCMRCSummary();
} else if (userRes === 3) {
  CatalogNGBS();
  CatalogSFDC();
} else if (userRes === 4) {
  importAccountReport();
} else if (userRes === 5) {
  Entitlements_DWH();
} else if (userRes === 6) {
  importCaseReport();
}
console.log("G'buy");
