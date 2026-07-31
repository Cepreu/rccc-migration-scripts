import configuration from "../../configuration.js";
import { db } from "../utils/DBSingleton.js";
import { StatExport } from "./StatExport.js";
import { ICBExport } from "./ICBExport.js";
import { Account } from "./Account.js";
import { NiCEntitlements } from "./entitlements.js";
import { CaseEntitlements } from "./entC2C.js";
import { RuleEngine } from "./Rules.js";
import { resetOutputDir } from "../utils/write2file.js";

const ruleEngine = new RuleEngine();

//////////////////////
// prepareBatchFile
//////////////////////
export function prepareBatchFiles(batchName: string, billingMonth: string) {
  resetOutputDir([batchName]);
  Account.statExport = new StatExport([batchName], batchName);
  //  Account.errStatExport = new StatExport([batchName], `${batchName}`);
  Account.icbExport = new ICBExport([batchName], `ICB_${batchName}`);

  const stmtBatchAccounts = db.prepare(
    `SELECT
      EnterpriseAccountID AS ENTERPRISE_ACCOUNT_ID,	
      BillingID AS BILLING_ACCOUNT_ID,
      b.AccountName,
      b.batchID, 
      1210 AS ACCT_BRANDID,
      a.Brand AS BRANDNAME,
      CASE a.brand
        WHEN 'RingCentral' THEN 'USD'
        WHEN 'RingCentral Canada' THEN 'CAD'
        WHEN 'RingCentral AU' THEN 'AUD'
         WHEN 'RingCentral EU' THEN 'EUR'
        WHEN 'RingCentral UK' THEN 'GBP'
        ELSE PriceperSeatCurrency END AS CURRENCY,
      a.inContactBUID AS INCONTACT_BUID,
      '' AS PACKAGE_ID,
      PaymentPlan AS BILLING_TERM,
      b.SpendingLimit,
      a."No.ofInContactSeats",
      nic.ContactCenterNumber,
      DefaultTimeZone,
      GeoRegion,
      ImplementationTeam,
      a.PaymentMethod,
      a.ContactCenterMRR,
      a.CurrentTotalMRRconverted as totalMRR,
      a.BillingStreet || ', ' || a.BillingCity || ', ' || a.BillingState || ' ' || a.BillingZipCode || ', ' || a.BillingCountry AS BILLING_ADDRESS,
      a.CCStartDate,
      a.CCEndDate,
      a.SalesAgreementStartDate,
      a.SalesAgreementEndDate,
      c.email,
      c.phone
  FROM accounts_sfdc a
    INNER JOIN BatchAccounts b ON b.EID = EnterpriseAccountID
    LEFT JOIN nic_cases nic ON nic.UID = EnterpriseAccountID
    LEFT JOIN account_contact_info c ON c.EID=EnterpriseAccountID
  WHERE b.batchID=?
  GROUP BY EnterpriseAccountID  
  `.replace(/\s+/g, " ")
  );

  const stmtAccntEntitlements = db.prepare(
    `SELECT 
        EXT_PRODUCT_ID,
        Category,
        ITEM_NAME,
        ITBS_NAME,
        QNTY_THRESHOLD,
        OldPrice,
        OldQntyThreshold,
        CASE CURRENCY_CODE
          WHEN 'USD' THEN round(PRICEUSD,2)
          WHEN 'CAD' THEN round(PRICECAD,2)
          WHEN 'AUD' THEN round(PRICEAUD,2)
          WHEN 'EUR' THEN round(PRICEEUR,2)
          WHEN 'GBP' THEN round(PRICEGBP,2)
        END PRICE,
        CASE CURRENCY_CODE
          WHEN 'USD' THEN round(DiscountUSD,2)
          WHEN 'CAD' THEN round(DiscountCAD,2)
          WHEN 'AUD' THEN round(DiscountAUD,2)
          WHEN 'EUR' THEN round(DiscountEUR,2)
          WHEN 'GBP' THEN round(DiscountGBP,2)
        END DISCOUNT,
        CURRENCY_CODE AS CURRENCY,
        round(NiCPrice,2) NiCPrice,
        PARENT,
        ProductFamily,
        batchID
    FROM BatchEntitlements
    WHERE eid=?
      AND batchID=?
    ORDER BY AccountName, QNTY_THRESHOLD DESC, cast(EXT_PRODUCT_ID AS INTEGER), EXT_PRODUCT_ID, Category
  `.replace(/\s+/g, " ")
  );

  const rowEntsDWH = db.prepare(
    `
    SELECT
      e.USERID AS ENTERPRISE_ACCOUNT_ID,
      e.ID,
      e.START_DATE,
      e.END_DATE,
      e.COUNTRY_ID,
      e.COUNTRY_NAME,
      e.BILLING_ITEM_ID,
      e.EXT_PRODUCT_ID,
      REPLACE(e.ITEM_NAME,CHAR(160),' ') AS ITEM_NAME,
      e.RETAIL_PRICE,
      ${
        configuration.PERCENTAGE_TO_CURRENCY ? "'Currency'" : "e.DISCOUNT_TYPE"
      } AS DISCOUNT_TYPE,
      ${
        configuration.PERCENTAGE_TO_CURRENCY ? "e.DISCOUNT" : "e.DISCOUNT_VALUE"
      } AS DISCOUNT_VALUE,
      e.DISCOUNT,
      e.QNTY_THRESHOLD,
      e.MDURATION,
      e.ProductFamily AS TYPE_NAME,
      e.STATUS_NAME
    FROM Entitlements_DWH e	
    WHERE e.USERID=?
        AND e.STATUS_NAME='Active'
        AND (e.END_DATE > date('now') OR e.END_DATE IS NULL OR  e.END_DATE ='') 
      `.replace(/\s+/g, " ")
  );

  const problematicAccs = [];
  for (const account of stmtBatchAccounts.iterate(batchName)) {
    console.log(
      account.ENTERPRISE_ACCOUNT_ID,
      account.INCONTACT_BUID,
      account.AccountName
    );

    const row_ents = rowEntsDWH.all(account.ENTERPRISE_ACCOUNT_ID + "");

    const ents = stmtAccntEntitlements.all(
      String(account.ENTERPRISE_ACCOUNT_ID),
      batchName
    );
    const nics = db
      .prepare(NiCEntitlements.SQL)
      .all(account.INCONTACT_BUID + "", billingMonth);
    const cases = db
      .prepare(CaseEntitlements.SQL)
      .all(account.ENTERPRISE_ACCOUNT_ID + "");

    const currAccount = new Account(
      account,
      ents,
      nics,
      cases,
      row_ents,
      batchName,
      billingMonth
    );
    currAccount.validateAndExport(ruleEngine);
    if (!currAccount.info.VALID) {
      problematicAccs.push(account.ENTERPRISE_ACCOUNT_ID);
    }
  }

  if (problematicAccs.length > 0) {
    const placeholders = problematicAccs.map(() => "?").join(",");
    db.prepare(
      `UPDATE BatchAccounts SET batchID=? WHERE batchID=? AND EID IN (${placeholders})`
    ).run(`___${batchName}`, batchName, ...problematicAccs);
  }

  Account.statExport.close();
  Account.icbExport.close();
}
