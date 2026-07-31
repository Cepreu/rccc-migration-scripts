import { db } from "../utils/DBSingleton.js";
import type { Account } from "./Account.js";
import type { DataRows } from "../types.js";

export class Invoice {
  readonly account: Account;
  readonly billingMonth: string;

  constructor(account: Account, billingMonth: string) {
    this.account = account;
    this.billingMonth = billingMonth;
  }

  static get invoiceDates() {
    return db
      .prepare(
        "SELECT DISTINCT(BILLING_MONTH) FROM invoiceLines ORDER BY BILLING_MONTH DESC"
      )
      .all();
  }

  get invoiceLines() {
    const DELTA = 1.0;
    const invoiceLines = db
      .prepare("SELECT * FROM invoiceLines WHERE BILLING_MONTH=? AND USERID=?")
      .all(this.billingMonth, this.account.info.ENTERPRISE_ACCOUNT_ID)
      .filter(
        (il) =>
          il.ITEMNAME !== "Domestic Minutes Overage" &&
          il.ITEMNAME !== "International Minutes Overage" &&
          il.ITEMNAME !== "IVN Minutes Overage"
      );
    const total = invoiceLines.reduce(
      (sum, line) => sum + Number(line.AMOUNT ?? 0),
      0
    );
    const calcInvoice = this.#calculateInvoice();
    const newTotal = calcInvoice.reduce(
      (sum, line) => sum + Number(line.AMOUNT ?? 0),
      0
    );

    if (invoiceLines.length === 0) {
      this.account.logAlarm(
        "Invoices",
        `Invoice not found for the month beginning ${this.billingMonth}`
      );
    } else if (Math.abs(total - newTotal) > DELTA) {
      this.account.logAlarm(
        "Invoices",
        `Estimated total ($${newTotal.toFixed(
          2
        )}) does not match the actual total ($${total.toFixed(
          2
        )}). NEEDS ATTENTION!`
      );
    }

    invoiceLines.push({
      BILLING_MONTH: this.billingMonth,
      ITEMNAME: "Total:",
      AMOUNT: total,
    });
    invoiceLines.push(...calcInvoice);
    invoiceLines.push({
      BILLING_MONTH: this.billingMonth,
      ITEMNAME: "Total:",
      AMOUNT: newTotal,
    });

    return invoiceLines;
  }

  #calculateInvoice(): DataRows {
    // (1) Add recurrings
    const toInvoice = this.account.ngbsEnts.wrkColl
      .filter((ent) => ent.ProductFamily === "Recurring")
      .reduce<DataRows>((prev, ent) => {
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
    this.account.nicEntsMRS.wrkColl
      .filter((nic) => !!nic.SKU)
      .forEach((nic) => {
        const rcrnt = this.account.ngbsEnts.wrkColl.find(
          (ent) =>
            (ent.EXT_PRODUCT_ID === nic.SKU &&
              ent.ProductFamily === "Recurring") ||
            (/^308-/.test(nic.SKU) &&
              /^308-/.test(ent.EXT_PRODUCT_ID) &&
              ent.ProductFamily === "Recurring")
        );
        const threshold = !!rcrnt ? rcrnt.QNTY_THRESHOLD : 0;

        const ovrg = this.account.ngbsEnts.wrkColl.find(
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
