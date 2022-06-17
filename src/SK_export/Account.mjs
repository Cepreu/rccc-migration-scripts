import {
  NgbsEntitlements,
  NiCEntitlements,
  CaseEntitlements,
} from "./entitlements.mjs";
import configuration from "../../configuration.mjs";
import { write2excel } from "../utils/write2file.mjs";
import { Logger } from "./Logger.mjs";
import { db } from "../utils/DBSingleton.mjs";

export class Account {
  constructor(account, ents, nics, cases, batchName) {
    this.info = account;
    this.nicEntsC2C = new CaseEntitlements(cases);
    this.ngbsEnts = new NgbsEntitlements(ents);
    this.nicEntsMRS = new NiCEntitlements(nics);
    this.batchName = batchName;

    this.batchName = batchName;
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

  get errorsAndWarnings() {
    return this.logger.errsAndWars();
  }
  ////////
  validateAndExport(ruleEngine) {
    this.info.VALID = ruleEngine.run(this);
    const calcInvoice = this.#prepareInvoice();
    if (this.invoiceLines.length === 0) {
      this.logAlarm(
        "Invoices",
        `No invoices found in the DB for the month. NEEDS ATTENTION!`
      );
    } else if (
      calcInvoice[0].TOTAL_AMOUNT.toFixed(0) !==
      this.invoiceLines[0].TOTAL_AMOUNT.toFixed(0)
    ) {
      this.logAlarm(
        "Invoices",
        `Estimated total (${calcInvoice[0].TOTAL_AMOUNT.toFixed(
          2
        )}) does not matches real total (${this.invoiceLines[0].TOTAL_AMOUNT.toFixed(
          2
        )}). NEEDS ATTENTION!`
      );
    }
    this.invoiceLines.push(...calcInvoice);
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
        { tab: "NiC Entitlements", data: this.nicEntsC2C.wrkColl },
        { tab: "Changelog", data: this.logger.log },
        { tab: "Raw DWH", data: this.ngbsEnts.originalColl },
        { tab: "Raw Monthly", data: this.nicEntsMRS.originalColl },
        { tab: "Raw Cases", data: this.nicEntsC2C.originalColl },
        { tab: "GroupedCases", data: this.nicEntsC2C.consColl },
        {
          tab: "Invoice",
          data: this.invoiceLines,
          columns: [
            "BILLING_MONTH",
            "TOTAL_AMOUNT",
            "EXT_PRODUCT_ID",
            "ITEMNAME",
            "QUANTITY",
            "ITEM_PRICE",
            "ITEM_DISCOUNT",
            "AMOUNT",
          ],
        },
      ],
      [this.batchName],
      `${this.info.ENTERPRISE_ACCOUNT_ID}(${this.info.INCONTACT_BUID})${
        this.info.VALID ? (this.logger.hasAlarm() ? "_ALARM" : "") : "_FAILED"
      }`
    );
    this.nicEntsC2C = null;
    this.ngbsEnts = null;
    this.nicEntsMRS = null;
  }

  #prepareInvoice() {
    const toInvoice = [];
    this.ngbsEnts.wrkColl.forEach((ent) => {
      let qnty = 0;
      if (ent.ProductFamily === "Recurring") {
        qnty = ent.QNTY_THRESHOLD;
      } else {
        const mrc = this.nicEntsMRS.wrkColl.find(
          (e) => ent.EXT_PRODUCT_ID === e.SKU
        );
        if (mrc && mrc.Quantity > ent.QNTY_THRESHOLD) {
          qnty = mrc.Quantity - ent.QNTY_THRESHOLD;
        }
      }
      const amount = qnty * (ent.PRICE - ent.DISCOUNT);

      if (amount > 0) {
        toInvoice.push({
          BILLING_MONTH: configuration.BILLING_MONTH,
          EXT_PRODUCT_ID: ent.EXT_PRODUCT_ID + "/" + ent.Category,
          ITEMNAME: ent.ITEM_NAME,
          QUANTITY: qnty,
          ITEM_PRICE: ent.PRICE,
          ITEM_DISCOUNT: ent.DISCOUNT,
          AMOUNT: amount,
        });
      }
    });

    const usageItems = this.invoiceLines.filter(
      (il) =>
        il.ITEMNAME === "Domestic Minutes Overage" ||
        il.ITEMNAME === "International Minutes Overage" ||
        il.ITEMNAME === "IVN Minutes Overage"
    );
    if (usageItems.length > 0) {
      const usage = usageItems.reduce(
        (prev, curr) => {
          prev.AMOUNT += curr.AMOUNT;
          prev.QUANTITY += curr.QUANTITY;
          return prev;
        },
        {
          BILLING_MONTH: configuration.BILLING_MONTH,
          ITEMNAME: "Total Dom, Int, and IVN Minutes Overages",
          QUANTITY: 0,
          AMOUNT: 0,
        }
      );
      toInvoice.push(usage);
    }
    const total = toInvoice.reduce((prev, curr) => (prev += curr.AMOUNT), 0);
    return toInvoice.map((x) => ((x.TOTAL_AMOUNT = total), x));
  }
}
