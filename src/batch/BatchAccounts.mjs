import { db } from "../utils/DBSingleton.mjs";

export class BatchAccounts {
  static defaultSpendingLimit = 1.5;
  constructor(batchDescription) {
    this.bd = batchDescription;
    console.log(JSON.stringify(this.bd));
  }
  static deleteProblematic(batchID, accountID) {
    db.prepare(
      `UPDATE BatchAccounts SET batchID='___${batchID}' WHERE batchID='${batchID}' AND EID=${accountID}`
    ).run();
  }

  /////////
  get #batchSQL() {
    if (!this.bd.name) {
      console.log("ERROR: batchSQLBuilder: batchName is undefined");
      return null;
    }
    const wheres = ["sf.InContactBUID IS NOT NULL"];

    // if (true) {
    //   wheres.push(
    //     `EXISTS (SELECT inContact_account_ID__c FROM accounts_no_orders WHERE inContact_account_ID__c=sf.EnterpriseAccountID`
    //   );
    // }

    if (this.bd.accSizeMin) {
      wheres.push(`sf."No.ofInContactSeats" >= ${this.bd.accSizeMin}`);
    }
    if (this.bd.accSizeMax) {
      wheres.push(`sf."No.ofInContactSeats" < ${this.bd.accSizeMax}`);
    }
    wheres.push(
      this.bd.brand !== "Any"
        ? `sf.brand='${this.bd.brand}'`
        : `(sf.brand='RingCentral' OR sf.brand='RingCentral Canada' OR sf.brand='RingCentral AU' OR sf.brand='RingCentral EU' OR sf.brand='RingCentral UK')`
    );
    if (this.bd.PaymentPlan !== "Any") {
      wheres.push(`sf.PaymentPlan='${this.bd.PaymentPlan}'`);
    }
    if (this.bd.AccountPaymentMethod !== "Any") {
      wheres.push(`sf.AccountPaymentMethod='${this.bd.AccountPaymentMethod}'`);
    }
    if (this.bd.telcoProvider !== "Any") {
      if (this.bd.telcoProvider === "RC") {
        wheres.push(`sf.OutboundTransport LIKE 'RC Ad-Hoc%'`);
      } else if (this.bd.telcoProvider === "NiC") {
        wheres.push(`sf.OutboundTransport LIKE 'inContact Ad-Hoc%'`);
      } else {
        console.log(
          'ERROR: batchSQLBuilder: telcoProvider should be "NiC" or "RC"'
        );
        return null;
      }
    }
    if (this.bd.seatEdition !== "Any") {
      const inOrNot = this.bd.seatEdition === "Legacy" ? "NOT IN" : "IN";
      wheres.push(
        `sf.EnterpriseAccountID ${inOrNot} (
          SELECT DISTINCT a.accountID 
          FROM nic_case_items a 
          WHERE 
            skuid LIKE '1265_-%' OR 
            skuid LIKE '510-13%' OR 
            skuid IN ('4100-1713-000', '4102-1710-000', '4108-1716-000', '1440-1340-000', '1440-1341-000', '3350-1155-000', '3350-1157-000'))`
      );
    }
    if (this.bd.accountList.length > 0) {
      wheres.push(
        `sf.EnterpriseAccountID IN (${this.bd.accountList.join(",")})`
      );
    }
    if (this.bd.maxContactCenterMRR) {
      wheres.push(`sf.ContactCenterMRR <= ${this.bd.maxContactCenterMRR}`);
    }
    if (this.bd.maxTotalMRR) {
      wheres.push(`sf.totalMRR <= ${this.bd.maxTotalMRR}`);
    }

    let inner_join = "";
    let group_by_having = ``;

    if (this.bd.casesMax > 0) {
      inner_join = `INNER JOIN nic_cases c2c ON c2c.UID=sf.EnterpriseAccountID`;
      group_by_having = `GROUP BY UID HAVING COUNT(c2c.UID) >= ${this.bd.casesMin} AND COUNT(c2c.UID) <= ${this.bd.casesMax} `;
      if (this.bd.casesNBU) {
        group_by_having += ` AND COUNT(CASE WHEN Subject LIKE 'NBU%' THEN 1 END) >= 1`;
      }
    }

    const sql = `
            INSERT OR REPLACE 
            INTO BatchAccounts
                (batchID, EID, BID, UID, AccountName, brand, currency, SpendingLimit)
            SELECT 
                '${
                  this.bd.name
                }', sf.EnterpriseAccountID, sf.BillingID, sf.inContactBUID, sf.AccountName, sf.brand, 
                CASE sf.brand
                  WHEN 'RingCentral' THEN 'USD'
                  WHEN 'RingCentral Canada' THEN 'CAD'
                  WHEN 'RingCentral AU' THEN 'AUD'
                  ELSE sf.PriceperseatCurrency END,
                ${BatchAccounts.defaultSpendingLimit}
            FROM 
                accounts_sfdc sf
                ${inner_join}
            WHERE
                ${wheres.join(" AND ")}
                AND NOT EXISTS (
                    SELECT * FROM BatchAccounts bi WHERE sf.EnterpriseAccountID=bi.EID
                )
                ${group_by_having}
                ${this.bd.maxSize > 0 ? "LIMIT " + this.bd.maxSize : ""}
                `
      .replace(/\s+/g, " ")
      .trim();

    // AND EXISTS (
    //   SELECT * FROM invoiceLines WHERE BILLING_MONTH='${
    //     configuration.BILLING_MONTH
    //   }' AND USERID=sf.EnterpriseAccountID
    // )
    return sql;
  }
  ///////////////
  selectBatchAccounts() {
    let stmt = db.prepare(
      `
        CREATE TABLE IF NOT EXISTS BatchAccounts(
            batchID TEXT,
            EID TEXT PRIMARY KEY,
            BID TEXT UNIQUE,
            UID TEXT UNIQUE,
            AccountName TEXT,
            brand TEXT,
            currency TEXT,
            SpendingLimit NUMBER
        )`.replace(/\s+/g, " ")
    );
    let info = stmt.run();

    stmt = db.prepare(`DELETE FROM BatchAccounts WHERE batchID=? OR batchID=?`);
    info = stmt.run(this.bd.name, `___${this.bd.name}`);
    console.log(`BatchAccounts. Number of rows deleted: ${info.changes}`);

    // stmt = db.prepare(`DELETE FROM BatchEntitlements WHERE batchID=?`);
    // info = stmt.run(this.bd.name);
    // console.log(`BatchEntitlements. Number of rows deleted: ${info.changes}`);

    console.log(this.#batchSQL);
    stmt = db.prepare(this.#batchSQL);
    info = stmt.run();
    console.log(`Number of rows inserted: ${info.changes}`);
  }
}
