import { db } from "../utils/DBSingleton.mjs";

export class BatchDescription {
  static createTable() {
    db.prepare(
      `
        CREATE TABLE IF NOT EXISTS BatchDescription (
            name TEXT PRIMARY KEY,
            description TEXT,
            accSizeMin INTEGER,
            accSizeMax INTEGER,
            brand TEXT,
            telcoProvider TEXT,
            seatEdition TEXT,
            accountList TEXT,
            casesMin INTEGER,
            casesMax INTEGER,
            casesNBU TEXT,
            maxSize INTEGER,
            ContactCenterMRR NUMBER,
            totalMRR NUMBER,
            timestamp TEXT,
            PaymentPlan TEXT
        )
        `.replace(/\s+/g, " ")
    ).run();
  }

  constructor(
    name,
    description,
    accSizeMin,
    accSizeMax,
    brand,
    telcoProvider,
    seatEdition,
    accountList = [],
    saveFlag = true,
    casesMin = 0,
    casesMax = 0,
    casesNBU = false,
    maxSize = 2000,
    maxContactCenterMRR = 0.0,
    maxTotalMRR = 0.0,
    PaymentPlan = "Monthly"
  ) {
    this.name = name;
    this.description = description;
    this.accSizeMin = accSizeMin;
    this.accSizeMax = accSizeMax;
    this.brand = brand;
    this.telcoProvider = telcoProvider;
    this.seatEdition = seatEdition;
    this.accountList = accountList;
    this.casesMin = casesMin;
    this.casesMax = casesMax;
    this.casesNBU = casesNBU;
    this.maxSize = maxSize;
    this.maxContactCenterMRR = maxContactCenterMRR;
    this.maxTotalMRR = maxTotalMRR;
    this.PaymentPlan = PaymentPlan;

    if (saveFlag) {
      this.#saveToDB();
      //      this.#selectBatchAccounts();
    }
  }
  ////////////////
  static restoreFromDB(batchName) {
    const row = db
      .prepare(`SELECT * from BatchDescription WHERE name=?`)
      .get(batchName);
    if (row) {
      return new BatchDescription(
        row.name,
        row.description,
        row.accSizeMin,
        row.accSizeMax,
        row.brand,
        row.telcoProvider,
        row.seatEdition,
        row.accountList ? JSON.parse(row.accountList) : [],
        false,
        row.casesMin,
        row.casesMax,
        row.casesNBU === "true",
        row.maxSize,
        row.ContactCenterMRR,
        row.totalMRR,
        row.PaymentPlan
      );
    }
    return undefined;
  }
  /////////
  #saveToDB() {
    BatchDescription.createTable();

    const info = db
      .prepare(
        `INSERT OR REPLACE INTO BatchDescription 
            (name, description, accSizeMin, accSizeMax, brand, telcoProvider, seatEdition, accountList, 
                casesMin, casesMax, casesNBU, 
                maxSize, ContactCenterMRR, totalMRR, PaymentPlan,
                timestamp)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, strftime('%Y-%m-%d %H:%M:%S','now'))`
      )
      .run(
        this.name,
        this.description,
        this.accSizeMin,
        this.accSizeMax,
        this.brand,
        this.telcoProvider,
        this.seatEdition,
        JSON.stringify(this.accountList),
        this.casesMin,
        this.casesMax,
        this.casesNBU.toString(),
        this.maxSize,
        this.maxContactCenterMRR,
        this.maxTotalMRR,
        this.PaymentPlan
      );
    console.log(`Number of rows inserted: ${info.changes}`);
  }
}
