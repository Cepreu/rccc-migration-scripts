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

  constructor(account, ents, nics, cases, row_ents, batchName) {
    this.info = account;
    this.nicEntsC2C = new CaseEntitlements(cases);
    this.ngbsEnts = new NgbsEntitlements(ents);
    this.nicEntsMRS = new NiCEntitlements(nics);
    this.batchName = batchName;
    this.row_ents = row_ents;

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
    const calcInvoice = this.#prepareInvoice();

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
    this.#export2sk();
    Account.statExport.appendData([this.info], this.logger.errsAndWars());
    Account.icbExport.appendData(
      [this.info],
      this.row_ents,
      this.nicEntsC2C.wrkColl,
      this.nicEntsMRS.originalColl
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
          data: this.row_ents,
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
            "TOTAL_AMOUNT",
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
          ITEM_DISC: ent.DISCOUNT,
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

    if (this.invoiceLines.length === 0) {
      this.logAlarm(
        "Invoices",
        `No invoices found in the DB for the month. NEEDS ATTENTION!`
      );
    } else if (Math.abs(total - this.invoiceLines[0].TOTAL_AMOUNT) > DELTA) {
      this.logAlarm(
        "Invoices",
        `Estimated total ($${total.toFixed(
          2
        )}) does not matches real total ($${this.invoiceLines[0].TOTAL_AMOUNT.toFixed(
          2
        )}). NEEDS ATTENTION!`
      );
    }

    toInvoice.forEach((x) => (x.TOTAL_AMOUNT = total));
    return toInvoice;
  }
}
