import {
  NgbsEntitlements,
  NiCEntitlements,
  CaseEntitlements,
} from "./entitlements.mjs";
import { write2excel } from "../utils/write2file.mjs";
import { Logger } from "./Logger.mjs";
import { Invoice } from "./Invoice.mjs";

export class Account {
  static statExport;
  static errStatExport;
  static icbExport;
  static wrkAccFields = {
    "Revenue Team": "Yes",
    "Revenue Comments": "",
    "Billing Team": "Yes",
    "Billing  Comments": "",
    "Overall Migration Approval": "Yes",
  };

  constructor(account, ents, nics, cases, raw_ents, batchName, billingMonth) {
    this.info = account;
    this.nicEntsC2C = new CaseEntitlements(cases);
    this.ngbsEnts = new NgbsEntitlements(ents);
    this.nicEntsMRS = new NiCEntitlements(nics);
    this.batchName = batchName;
    this.raw_ents = raw_ents;

    this.icb_ents = JSON.parse(JSON.stringify(raw_ents));
    if (this.info.BILLING_TERM === "Monthly") {
      this.icb_ents.forEach((ent) => {
        if (ent.MDURATION == 12 && ent.TYPE_NAME === "Recurring") {
          ent.RETAIL_PRICE /= 12.0;
          ent.DISCOUNT /= 12.0;
          if (ent.DISCOUNT_TYPE === "Currency") {
            ent.DISCOUNT_VALUE /= 12.0;
          }
        }
      });
    }

    this.info.VALID = true;
    this.logger = new Logger(this.info.ENTERPRISE_ACCOUNT_ID);
    this.facts = {
      NBU: !!this.nicEntsC2C.originalColl.find((c) => /^NBU/.test(c.subject)),
    };

    this.invoice = new Invoice(this, billingMonth);
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

    const errors = this.logger.errsAndWars();
    this.info.Error = this.logger.worstProblem();
    if (this.info.VALID) {
      Account.statExport.appendData(
        [{ ...this.info, ...Account.wrkAccFields }],
        errors
      );
      Account.icbExport.appendData(
        [this.info],
        this.icb_ents,
        this.nicEntsC2C.wrkColl,
        this.nicEntsMRS.wrkColl
      );
    } else {
      // BatchAccounts.deleteProblematic(
      //   this.batchName,
      //   this.info.ENTERPRISE_ACCOUNT_ID
      // );
      //Account.statExport.appendData([this.info], errors);
    }

    this.nicEntsC2C = null;
    this.ngbsEnts = null;
    this.nicEntsMRS = null;
  }

  #export2sk() {
    const pathArr = [];
    let fileName = `${this.info.ENTERPRISE_ACCOUNT_ID}(${this.info.INCONTACT_BUID})`;
    if (this.info.VALID) {
      pathArr.push(this.batchName, "Account Analytics");
      this.logger.hasAlarm() && (fileName += "_ALARM");
    } else {
      pathArr.push(this.batchName, "Accounts with Errors");
      fileName += "_FAILED";
    }
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
          data: this.invoice.invoiceLines,
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
      pathArr,
      fileName
    );
  }
}
