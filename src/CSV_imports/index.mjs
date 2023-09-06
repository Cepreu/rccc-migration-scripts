import consMenu from "../utils/consMenu.mjs";
import fileChooser from "../utils/fileChooser.mjs";
import { Entitlements_DWH } from "./Entitlements_DWH.mjs";
import { Invoices, InvoiceLines } from "./invoices.mjs";
import { RCMRCSummary } from "./RCMRCSummary.mjs";
import { CatalogNGBS, CatalogSFDC } from "./catalog.mjs";
import { importAccountReport } from "./Accounts_SFDC.mjs";
import { importAccountContactInfo } from "./accountContactInfo.mjs";
import { importCaseReport } from "./case2cases_SFDC.mjs";
import configuration from "../../configuration.mjs";
import xlsxExtractor from "../utils/xlsxExtractor.mjs";

const userRes = consMenu(
  [
    "Entitlements (DEPRECATED)",
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
  //  EntitlementsLOG();
} else if (userRes === 1) {
  const fileXlsx = fileChooser(configuration.DWH_INVOICES, "xlsx");
  if (fileXlsx) {
    xlsxExtractor(fileXlsx, "InvoiceHeader", Invoices);
    xlsxExtractor(fileXlsx, "InvoiceLines", InvoiceLines);
  }
} else if (userRes === 2) {
  const file = fileChooser(configuration.NIC_RCMRCSUMMARY);
  RCMRCSummary(file);
} else if (userRes === 3) {
  CatalogNGBS();
  CatalogSFDC();
} else if (userRes === 4) {
  const file = fileChooser(configuration.SFDC_ACCOUNTS);
  importAccountReport(file);
} else if (userRes === 5) {
  const file = fileChooser(configuration.DWH_ENTITLEMENTS);
  Entitlements_DWH(file);
} else if (userRes === 6) {
  const file = fileChooser(configuration.C2CPATH);
  importCaseReport(file);
} else if (userRes === 7) {
  const file = fileChooser(configuration.SFDC_ACCOUNTS);
  importAccountContactInfo(file);
}
console.log("G'buy");
