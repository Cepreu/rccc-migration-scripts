import {
  NgbsEntitlements,
  NiCEntitlements,
  CaseEntitlements,
} from "./entitlements.mjs";
import configuration from "../../configuration.mjs";
import { write2excel } from "../utils/write2file.mjs";
import { Logger } from "./Logger.mjs";
import { db } from "../utils/DBSingleton.mjs";

const DELTA = 1.0;

export class Account {
  static statExport;
  static icbExport;

  constructor(account, ents, nics, cases, raw_ents, batchName) {
    this.info = account;
    this.nicEntsC2C = new CaseEntitlements(cases);
    this.ngbsEnts = new NgbsEntitlements(ents);
    this.nicEntsMRS = new NiCEntitlements(nics);
    this.batchName = batchName;
    this.raw_ents = raw_ents;

    this.info.VALID = true;
    this.logger = new Logger(this.info.ENTERPRISE_ACCOUNT_ID);
    this.facts = {
      NBU: !!this.nicEntsC2C.originalColl.find((c) => /^NBU/.test(c.subject)),
    };

    this.invoiceLines = db
      .prepare("SELECT * FROM invoiceLines WHERE BILLING_MONTH=? AND USERID=?")
      .all(configuration.BILLING_MONTH, this.info.ENTERPRISE_ACCOUNT_ID);
  }
  get CURRENCY() {
    return this.info.CURRENCY;
  }
  get ents() {
    return this.ngbsEnts.wrkColl;
  }
  set ents(newEnts) {
    this.ngbsEnts.wrkColl = newEnts;
  }
  get nics() {
    return this.nicEntsMRS.wrkColl;
  }
  get cases() {
    return this.nicEntsC2C.wrkColl;
  }
  set cases(newCases) {
    this.nicEntsC2C.wrkColl = newCases;
  }

  ////////
  validateAndExport(ruleEngine) {
    this.info.VALID = ruleEngine.run(this);
    this.#compareInvoices();
    this.#finalize();
  }
  ////////

  logInfo(ruleName, description) {
    this.logger.logElem(Logger.INFO, ruleName, description);
    return true;
  }
  logWarning(ruleName, description) {
    this.logger.logElem(Logger.WARNING, ruleName, description);
    return true;
  }
  logAlarm(ruleName, description) {
    this.logger.logElem(Logger.ALARM, ruleName, description);
    return true;
  }
  logError(ruleName, description) {
    this.logger.logElem(Logger.ERROR, ruleName, description);
    return true;
  }

  #finalize() {
    this.#export2sk();
    Account.statExport.appendData([this.info], this.logger.errsAndWars());
    Account.icbExport.appendData(
      [this.info],
      this.raw_ents,
      this.nicEntsC2C.wrkColl,
      //      this.nicEntsMRS.originalColl
      this.nicEntsMRS.wrkColl
    );

    this.nicEntsC2C = null;
    this.ngbsEnts = null;
    this.nicEntsMRS = null;
  }

  #export2sk() {
    write2excel(
      [
        { tab: "Account", data: [this.info] },
        {
          tab: "RC Entitlements",
          data: this.ngbsEnts.wrkColl,
          columns: [
            "Category",
            "ITEM_NAME",
            "QNTY_THRESHOLD",
            "PRICE",
            "DISCOUNT",
            "CURRENCY",
          ],
        },
        {
          tab: "NiC Entitlements",
          data: this.nicEntsC2C.wrkColl,
          columns: ["accountID", "BUID", "skuid", "sku", "price", "qtty"],
        },
        { tab: "Changelog", data: this.logger.log },
        {
          tab: "Orig DWH",
          data: this.ngbsEnts.originalColl,
        },
        {
          tab: "Raw DWH",
          data: this.raw_ents,
        },
        {
          tab: "Raw Monthly",
          data: this.nicEntsMRS.originalColl,
          columns: ["SKU", "Product", "Quantity", "Amount", "Price"],
        },
        {
          tab: "Raw Cases",
          data: this.nicEntsC2C.originalColl,
          columns: [
            "subject",
            "ProvisionDate",
            "sfdcCase",
            "oper",
            "skuid",
            "sku",
            "qtty",
            "price",
          ],
        },
        { tab: "GroupedCases", data: this.nicEntsC2C.consColl },
        {
          tab: "Invoice",
          data: this.invoiceLines,
          columns: [
            "BILLING_MONTH",
            "EXT_PRODUCT_ID",
            "ITEMNAME",
            "QUANTITY",
            "ITEM_PRICE",
            "ITEM_DISC",
            "AMOUNT",
          ],
        },
      ],
      [this.batchName],
      `${this.info.ENTERPRISE_ACCOUNT_ID}(${this.info.INCONTACT_BUID})${
        this.info.VALID ? (this.logger.hasAlarm() ? "_ALARM" : "") : "_FAILED"
      }`
    );
  }

  #compareInvoices() {
    this.invoiceLines = this.invoiceLines.filter(
      (il) =>
        il.ITEMNAME !== "Domestic Minutes Overage" &&
        il.ITEMNAME !== "International Minutes Overage" &&
        il.ITEMNAME !== "IVN Minutes Overage"
    );
    const total = this.invoiceLines.reduce(
      (prev, curr) => (prev += curr.AMOUNT),
      0
    );
    const calcInvoice = this.#prepareInvoice();
    const newTotal = calcInvoice.reduce(
      (prev, curr) => (prev += curr.AMOUNT),
      0
    );
    if (Math.abs(total - newTotal) > DELTA) {
      this.logAlarm(
        "Invoices",
        `Estimated total ($${newTotal.toFixed(
          2
        )}) does not matches real total ($${total.toFixed(
          2
        )}). NEEDS ATTENTION!`
      );
    }

    this.invoiceLines.push({
      BILLING_MONTH: configuration.BILLING_MONTH,
      ITEMNAME: "Total:",
      AMOUNT: total,
    });
    this.invoiceLines.push(...calcInvoice);
    this.invoiceLines.push({
      BILLING_MONTH: configuration.BILLING_MONTH,
      ITEMNAME: "Total:",
      AMOUNT: newTotal,
    });
  }

  #prepareInvoice() {
    // (1) Add recurrings
    const toInvoice = this.ngbsEnts.wrkColl
      .filter((ent) => ent.ProductFamily === "Recurring")
      .reduce((prev, ent) => {
        prev.push({
          EXT_PRODUCT_ID: `${ent.Category} (${
            ent.EXT_PRODUCT_ID ? ent.EXT_PRODUCT_ID : ""
          })`,
          ITEMNAME: ent.ITEM_NAME,
          QUANTITY: ent.QNTY_THRESHOLD,
          ITEM_PRICE: ent.PRICE,
          ITEM_DISC: ent.DISCOUNT,
          AMOUNT: ent.QNTY_THRESHOLD * (ent.PRICE - ent.DISCOUNT),
        });
        return prev;
      }, []);

    // (2) Add overages
    this.nicEntsMRS.wrkColl
      .filter((nic) => !!nic.SKU)
      .forEach((nic) => {
        const rcrnt = this.ngbsEnts.wrkColl.find(
          (ent) =>
            ent.EXT_PRODUCT_ID === nic.SKU && ent.ProductFamily === "Recurring"
        );
        const threshold = rcrnt ? rcrnt.QNTY_THRESHOLD : 0;

        const ovrg = this.ngbsEnts.wrkColl.find(
          (ent) =>
            ent.EXT_PRODUCT_ID === nic.SKU && ent.ProductFamily === "Overage"
        );

        if (ovrg) {
          const qnty = nic.Quantity - threshold;
          const amount = qnty * (ovrg.PRICE - ovrg.DISCOUNT);
          if (amount > 0) {
            toInvoice.push({
              EXT_PRODUCT_ID: `${ovrg.Category} (${
                ovrg.EXT_PRODUCT_ID ? ovrg.EXT_PRODUCT_ID : ""
              })`,
              ITEMNAME: ovrg.ITEM_NAME,
              QUANTITY: qnty,
              ITEM_PRICE: ovrg.PRICE,
              ITEM_DISC: ovrg.DISCOUNT,
              AMOUNT: amount,
            });
          }
        }
      });
    return toInvoice;
  }
}
