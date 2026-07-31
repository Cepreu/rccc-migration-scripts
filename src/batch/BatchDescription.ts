import { db } from "../utils/DBSingleton.js";

export interface BatchDescriptionInput {
  name: string;
  description?: string;
  accSizeMin?: number;
  accSizeMax?: number;
  brand?: string;
  telcoProvider?: string;
  seatEdition?: string;
  accountList?: Array<string | number>;
  saveFlag?: boolean;
  casesMin?: number;
  casesMax?: number;
  casesNBU?: boolean;
  maxSize?: number;
  maxContactCenterMRR?: number;
  maxTotalMRR?: number;
  PaymentPlan?: string;
  AccountPaymentMethod?: string;
  AnnualMonth?: number;
}

export class BatchDescription {
  readonly name: string;
  readonly description: string;
  readonly accSizeMin: number;
  readonly accSizeMax: number;
  readonly brand: string;
  readonly telcoProvider: string;
  readonly seatEdition: string;
  readonly accountList: Array<string | number>;
  readonly casesMin: number;
  readonly casesMax: number;
  readonly casesNBU: boolean;
  readonly maxSize: number;
  readonly maxContactCenterMRR: number;
  readonly maxTotalMRR: number;
  readonly PaymentPlan: string;
  readonly AccountPaymentMethod: string;
  readonly AnnualMonth: number;

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
            PaymentPlan TEXT,
            AccountPaymentMethod TEXT,
            AnnualMonth INTEGER
        )
        `.replace(/\s+/g, " ")
    ).run();
  }

  constructor({
    name,
    description = "",
    accSizeMin = 0,
    accSizeMax = 0,
    brand = "Any",
    telcoProvider = "Any",
    seatEdition = "Any",
    accountList = [],
    saveFlag = true,
    casesMin = 0,
    casesMax = 0,
    casesNBU = false,
    maxSize = 0,
    maxContactCenterMRR = 0.0,
    maxTotalMRR = 0.0,
    PaymentPlan = "Monthly",
    AccountPaymentMethod = "Invoice",
    AnnualMonth = 0,
  }: BatchDescriptionInput) {
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
    this.AccountPaymentMethod = AccountPaymentMethod;
    this.AnnualMonth = AnnualMonth;

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
    return row
      ? new BatchDescription({
          name: row.name,
          description: row.description,
          accSizeMin: row.accSizeMin,
          accSizeMax: row.accSizeMax,
          brand: row.brand,
          telcoProvider: row.telcoProvider,
          seatEdition: row.seatEdition,
          accountList: row.accountList ? JSON.parse(row.accountList) : [],
          casesMin: row.casesMin,
          casesMax: row.casesMax,
          casesNBU: row.casesNBU === "true",
          maxSize: row.maxSize,
          maxContactCenterMRR: row.ContactCenterMRR,
          maxTotalMRR: row.totalMRR,
          PaymentPlan: row.PaymentPlan,
          AccountPaymentMethod: row.AccountPaymentMethod,
          AnnualMonth: row.AnnualMonth,
        })
      : undefined;
  }
  /////////
  #saveToDB() {
    BatchDescription.createTable();

    const info = db
      .prepare(
        `INSERT OR REPLACE INTO BatchDescription 
            (name, description, accSizeMin, accSizeMax, brand, telcoProvider, seatEdition, accountList, 
                casesMin, casesMax, casesNBU, 
                maxSize, ContactCenterMRR, totalMRR, PaymentPlan,AccountPaymentMethod,AnnualMonth,
                timestamp)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, strftime('%Y-%m-%d %H:%M:%S','now'))`
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
        this.PaymentPlan,
        this.AccountPaymentMethod,
        this.AnnualMonth
      );
    console.log(`Number of rows inserted: ${info.changes}`);
  }
}
