export class BatchAccounts {
  constructor(batchDescription) {
    this.bd = batchDescription;
    this.name = batchDescription.name;
  }

  /////////
  get #batchSQL() {
    const wheres = ["1=1"];
    if (this.bd.accSizeMin) {
      wheres.push(`sf."No.ofInContactSeats" >= ${this.bd.accSizeMin}`);
    }
    if (this.bd.accSizeMax) {
      wheres.push(`sf."No.ofInContactSeats" < ${this.bd.accSizeMax}`);
    }
    wheres.push(
      this.bd.brand
        ? `sf.brand='${this.bd.brand}'`
        : `(sf.brand='RingCentral' OR sf.brand='RingCentral Canada')`
    );
    if (this.bd.telcoProvider) {
      if (this.telcoProvider === "RC") {
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
    if (this.bd.seatEdition) {
      const inOrNot = this.seatEdition === "Legacy" ? "NOT IN" : "IN";
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
      wheres.push(`sf.EnterpriseAccountID IN (${this.accountList.join(",")})`);
    }
    if (!this.bd.name) {
      console.log("ERROR: batchSQLBuilder: batchName is undefined");
      return null;
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
                (batchID, EID, BID, UID, AccountName, brand, currency)
            SELECT 
                '${
                  this.bd.name
                }', sf.EnterpriseAccountID, sf.BillingID, sf.inContactBUID, sf.AccountName, sf.brand, sf.PriceperseatCurrency
            FROM 
                accounts_sfdc sf
                ${inner_join}
            WHERE
                ${wheres.join(" AND ")}
                AND NOT EXISTS (
                    SELECT * FROM BatchAccounts bi WHERE sf.EnterpriseAccountID=bi.EID
                )
                ${group_by_having}
            LIMIT ${this.bd.maxSize}
            `
      .replace(/\s+/g, " ")
      .trim();

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
            currency TEXT
        )`.replace(/\s+/g, " ")
    );
    let info = stmt.run();

    stmt = db.prepare(`DELETE FROM BatchAccounts WHERE batchID=?`);
    info = stmt.run(this.name);
    console.log(`BatchAccounts. Number of rows deleted: ${info.changes}`);

    stmt = db.prepare(`DELETE FROM BatchEntitlements WHERE batchID=?`);
    info = stmt.run(this.name);
    console.log(`BatchEntitlements. Number of rows deleted: ${info.changes}`);

    stmt = db.prepare(this.#batchSQL);
    info = stmt.run();
    console.log(`Number of rows inserted: ${info.changes}`);
  }
}
