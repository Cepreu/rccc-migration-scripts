import consMenu from "../utils/consMenu.js";
import fileChooser from "../utils/fileChooser.js";
import { Entitlements_DWH } from "./Entitlements_DWH.js";
import { Invoices, InvoiceLines } from "./invoices.js";
import { RCMRCSummary } from "./RCMRCSummary.js";
import { CatalogNGBS, CatalogSFDC } from "./catalog.js";
import { importAccountReport } from "./Accounts_SFDC.js";
import { importAccountContactInfo } from "./accountContactInfo.js";
import { importCaseReport } from "./case2cases_SFDC.js";
import configuration from "../../configuration.js";
import xlsxExtractor from "../utils/xlsxExtractor.js";

const userRes = consMenu(
  [
    "Invoices",
    "RCMRCSummary",
    "Catalog",
    "Account Report SFDC",
    "Entitlements DWH",
    "Case2Case",
    "Account Contact Info",
  ],
  true
);

if (userRes === 0) {
  const fileXlsx = fileChooser(configuration.DWH_INVOICES, "xlsx");
  if (fileXlsx) {
    xlsxExtractor(fileXlsx, "InvoiceHeader", Invoices);
    xlsxExtractor(fileXlsx, "InvoiceLines", InvoiceLines);
  }
} else if (userRes === 1) {
  const file = fileChooser(configuration.NIC_RCMRCSUMMARY);
  RCMRCSummary(file);
} else if (userRes === 2) {
  CatalogNGBS();
  CatalogSFDC();
} else if (userRes === 3) {
  const file = fileChooser(configuration.SFDC_ACCOUNTS);
  importAccountReport(file);
} else if (userRes === 4) {
  const file = fileChooser(configuration.DWH_ENTITLEMENTS);
  Entitlements_DWH(file);
} else if (userRes === 5) {
  const file = fileChooser(configuration.C2CPATH);
  importCaseReport(file);
} else if (userRes === 6) {
  const file = fileChooser(configuration.SFDC_ACCOUNTS);
  importAccountContactInfo(file);
}
console.log("G'buy");
