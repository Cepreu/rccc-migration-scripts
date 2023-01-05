import configuration from "../../configuration.mjs";
import { db } from "../utils/DBSingleton.mjs";
import { StatExport } from "./StatExport.mjs";
import { ICBExport } from "./ICBExport.mjs";
import { Account } from "./Account.mjs";
import { NiCEntitlements, CaseEntitlements } from "./entitlements.mjs";
import { RuleEngine } from "./RuleEngine.mjs";

const ruleEngine = new RuleEngine();

//////////////////////
// prepareBatchFile
//////////////////////
export function prepareBatchFiles(batchName) {
  Account.statExport = new StatExport([batchName], batchName);
  Account.icbExport = new ICBExport([batchName], `ICB_${batchName}`);

  const stmtBatchAccounts = db.prepare(
    `SELECT
      EnterpriseAccountID AS ENTERPRISE_ACCOUNT_ID,	
      BillingID AS BILLING_ACCOUNT_ID,
      b.AccountName,
      b.batchID, 
      1210 AS ACCT_BRANDID,
      a.Brand AS BRANDNAME,
      PriceperSeatCurrency AS CURRENCY,
      a.inContactBUID AS INCONTACT_BUID,
      '' AS PACKAGE_ID,
      PaymentPlan AS BILLING_TERM,
      '' AS SPENDING_LIMIT,
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
      a.SalesAgreementEndDate
  FROM accounts_sfdc a
    INNER JOIN BatchAccounts b ON b.EID = EnterpriseAccountID
    INNER JOIN nic_cases nic ON nic.UID = EnterpriseAccountID
  WHERE b.batchID=?
  GROUP BY EnterpriseAccountID  
  `.replace(/\s+/g, " ")
  );

  const stmtAccntEntitlements = db.prepare(
    `SELECT 
        b.EXT_PRODUCT_ID,
        b.Category,
        b.ITEM_NAME,
        b.ITBS_NAME,
        b.QNTY_THRESHOLD,
        b.OldPrice,
        CASE b.CURRENCY_CODE WHEN 'USD' THEN round(PRICEUSD,2) WHEN 'CAD' THEN round(PRICE,2) END PRICE,
        CASE b.CURRENCY_CODE WHEN 'USD' THEN round(DiscountUSD,2) WHEN 'CAD' THEN round(Discount,2) END DISCOUNT,
        b.CURRENCY_CODE AS CURRENCY,
        round(NiCPrice,2) NiCPrice,
        b.PARENT,
        b.ProductFamily,
        b.batchID
    FROM BatchEntitlements b
    WHERE eid=?
    ORDER BY b.AccountName, b.QNTY_THRESHOLD DESC, cast(b.EXT_PRODUCT_ID AS INTEGER), b.EXT_PRODUCT_ID, b.Category
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
      e.ITEM_NAME,
      e.RETAIL_PRICE,
      e.DISCOUNT_VALUE,
      e.QNTY_THRESHOLD,
      e.ProductFamily AS TYPE_NAME,
      e.STATUS_NAME
    FROM Entitlements_DWH e	
    WHERE e.USERID=?
        AND e.STATUS_NAME='Active'
        AND (e.END_DATE > date('now') OR e.END_DATE IS NULL OR  e.END_DATE ='') 
      `.replace(/\s+/g, " ")
  );

  for (const account of stmtBatchAccounts.iterate(batchName)) {
    console.log(
      account.ENTERPRISE_ACCOUNT_ID,
      account.INCONTACT_BUID,
      account.AccountName
    );

    const row_ents = rowEntsDWH.all(account.ENTERPRISE_ACCOUNT_ID + "");

    const ents = stmtAccntEntitlements.all(account.ENTERPRISE_ACCOUNT_ID + "");
    const nics = db
      .prepare(NiCEntitlements.SQL)
      .all(account.INCONTACT_BUID + "", configuration.BILLING_MONTH);
    const cases = db
      .prepare(CaseEntitlements.SQL)
      .all(account.ENTERPRISE_ACCOUNT_ID + "");

    const currAccount = new Account(
      account,
      ents,
      nics,
      cases,
      row_ents,
      batchName
    );
    currAccount.validateAndExport(ruleEngine);
  }

  Account.statExport.close();
  Account.icbExport.close();
}
