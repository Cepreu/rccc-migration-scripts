import configuration from "../../configuration.mjs";
import { db } from "../utils/DBSingleton.mjs";
import { write2excel } from "../utils/write2file.mjs";
import { Account } from "./Account.mjs";
import {
  NgbsEntitlements,
  NiCEntitlements,
  CaseEntitlements,
} from "./entitlements.mjs";
import { RuleEngine } from "./RuleEngine.mjs";

const allAccounts = [];
const ruleEngine = new RuleEngine();

//////////////////////
// prepareBatchFile
//////////////////////
export function prepareBatchFiles(batchName) {
  const stmtB = db.prepare(
    `SELECT DISTINCT 
            e.EID AS ENTERPRISE_ACCOUNT_ID,
            e.UID AS INCONTACT_BUID,
            e.BID AS BILLING_ID,
            e.AccountName,
            b.batchID,
            b.brand AS BRANDNAME,
            b.currency AS CURRENCY,
            'MONTHLY' AS BILLING_TERM,
            'LEGACY' AS CATALOG
        FROM BatchAccounts b
        INNER JOIN BatchEntitlements e
          ON b.EID=e.EID AND b.batchID=e.batchID
        WHERE
          b.batchID='${batchName}'
        ORDER BY e.AccountName`.replace(/\s+/g, " ")
  );

  const stmt = db.prepare(
    `SELECT 
          EXT_PRODUCT_ID,
          Category,
          ITEM_NAME,
          ITBS_NAME,
          QNTY_THRESHOLD,
          OldPrice,
          CASE CURRENCY_CODE WHEN 'USD' THEN round(PRICEUSD,2) WHEN 'CAD' THEN round(PRICE,2) END PRICE,
          CASE CURRENCY_CODE WHEN 'USD' THEN round(DiscountUSD,2) WHEN 'CAD' THEN round(Discount,2) END DISCOUNT,
          CURRENCY_CODE AS CURRENCY,
          round(NiCPrice,2) NiCPrice,
          PARENT,
          ProductFamily,
          batchID
      FROM BatchEntitlements
      WHERE batchID=? AND eid=?
      ORDER BY AccountName, QNTY_THRESHOLD DESC, cast(EXT_PRODUCT_ID AS INTEGER), EXT_PRODUCT_ID, Category
      `.replace(/\s+/g, " ")
  );

  for (const account of stmtB.iterate()) {
    const ents = stmt.all(batchName, account.ENTERPRISE_ACCOUNT_ID);
    const nics = db
      .prepare(NiCEntitlements.SQL)
      .all(account.INCONTACT_BUID, configuration.BILLING_MONTH);
    const cases = db
      .prepare(CaseEntitlements.SQL)
      .all(account.ENTERPRISE_ACCOUNT_ID);

    console.log(
      account.ENTERPRISE_ACCOUNT_ID,
      account.INCONTACT_BUID,
      account.AccountName
    );
    console.table(nics);
    console.table(cases);

    const currAccount = new Account(account, ents, nics, cases, batchName);
    currAccount.validateAndExport(ruleEngine);
    allAccounts.push(currAccount);
  }

  const errs = allAccounts.reduce((res, acc) => {
    res.push(...acc.errorsAndWarnings);
    return res;
  }, []);
  write2excel(
    [
      {
        tab: "Accounts",
        data: allAccounts.reduce((res, acc) => {
          res.push(acc.info);
          return res;
        }, []),
      },
      { tab: "ErrsAndWarns", data: errs },
    ],
    [batchName],
    "account_list"
  );
}
