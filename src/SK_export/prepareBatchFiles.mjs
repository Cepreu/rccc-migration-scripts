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
export function prepareBatchFiles(batchName, billingMonth) {
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
      PriceperSeatCurrency AS CURRENCY,
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
        EXT_PRODUCT_ID,
        Category,
        ITEM_NAME,
        ITBS_NAME,
        QNTY_THRESHOLD,
        OldPrice,
        OldQntyThreshold,
        CASE CURRENCY_CODE WHEN 'USD' THEN round(PRICEUSD,2) WHEN 'CAD' THEN round(PRICE,2) END PRICE,
        CASE CURRENCY_CODE WHEN 'USD' THEN round(DiscountUSD,2) WHEN 'CAD' THEN round(Discount,2) END DISCOUNT,
        CURRENCY_CODE AS CURRENCY,
        round(NiCPrice,2) NiCPrice,
        PARENT,
        ProductFamily,
        batchID
    FROM BatchEntitlements
    WHERE eid=? 
      AND batchID='${batchName}'
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
      e.ITEM_NAME,
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

    const ents = stmtAccntEntitlements.all(account.ENTERPRISE_ACCOUNT_ID + "");
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

  db.prepare(
    `UPDATE BatchAccounts SET batchID='___${batchName}' WHERE batchID='${batchName}' AND EID IN (${problematicAccs.join(
      ","
    )})`
  ).run();

  Account.statExport.close();
  Account.icbExport.close();
}
