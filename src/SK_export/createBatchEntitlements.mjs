import { db } from "../utils/DBSingleton.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";

const Exc = [
  "308-8-167",
  "309-11-171",
  "309-11-172", // Contact Center: [(-)Additional ]Active Storage (per GB for concurrent user)  Overage
  "309-565-000",
  "310-557-000", // Contact Center: PCI Level 1 Seat License - Add On (per Named-User Seat Edition) [+ Overage]
  "500-617-000",
  "1032-173-000",
  "1032-174-000",
  "1032-175-000",
  "1032-487-000",
  "1032-493-000",
  "1032-494-000",
  "1032-572-000",
  "1503-693-000",
  "1503-694-000",
  "3465-22-000", // Contact Center: [(-)inView ]Performance Management (per Named-User)
  "3465-521-000", // Contact Center: [(+)Performance Management -][(-)InView] Gamification (per Named-User)
  "3465-1227-000",
  "4100-701-000",
  "4102-829-000", // Contact Center: Quality Management Analytics[(+) Pro] (per Named-User)
  "4107-645-000", // Contact Center: Audio Recording [(-)Advanced][(+) Pro] (per Named-User)
  "4108-561-000", // Contact Center: [(-)Omnichannel Analytics][(+)Interaction Analytics (per Named-User)]
  "4109-673-000",
  "610064-302-000", // Professional Services On[(+)-]Demand (per 15-minute block)
];

const flds = [
  { name: "EID", type: "TEXT" },
  { name: "UID", type: "TEXT" },
  { name: "BID", type: "TEXT" },
  { name: "AccountName", type: "TEXT" },
  { name: "EXT_PRODUCT_ID", type: "TEXT" },
  { name: "ITEM_NAME", type: "TEXT" },
  { name: "ITBS_NAME", type: "TEXT" },
  { name: "RETAIL_PRICE", type: "NUMBER" },
  { name: "MDURATION", type: "INTEGER" },
  { name: "CURRENCY_CODE", type: "TEXT" },
  { name: "OldPrice", type: "NUMBER" },
  { name: "QNTY_THRESHOLD", type: "INTEGER" },
  { name: "PriceUSD", type: "NUMBER" },
  { name: "Price", type: "NUMBER" },
  { name: "DiscountUSD", type: "NUMBER" },
  { name: "Discount", type: "NUMBER" },
  { name: "NiCPrice", type: "NUMBER" },
  { name: "Category", type: "TEXT" },
  { name: "PARENT", type: "TEXT" },
  { name: "ProductFamily", type: "TEXT" },
  { name: "batchID", type: "TEXT" },
];

function prepareTable(batchName) {
  let info = db
    .prepare(
      `CREATE TABLE IF NOT EXISTS BatchEntitlements (${flds
        .map((f) => f.name + " " + f.type)
        .join(", ")})`
    )
    .run();

  info = db
    .prepare(`DELETE FROM BatchEntitlements WHERE batchID='${batchName}'`)
    .run();

  console.log(`Deleted from BatchEntitlements.`);
}

function selectEntitlements(batchName) {
  const insertSql = `
    INSERT INTO BatchEntitlements
      (${flds.map((f) => f.name).join(", ")})
    SELECT DISTINCT
        b.EID,
        b.UID,
        b.BID,
        b.AccountName,
        e.EXT_PRODUCT_ID,
        lc.ngbs_name,
        CASE WHEN e.ITEM_NAME!=lc.ngbs_name THEN e.ITEM_NAME ELSE '' END,
        e.RETAIL_PRICE,
        bi.MDURATION,
        bi.CURRENCY_CODE,
        (e.RETAIL_PRICE-e.DISCOUNT_VALUE) / CASE WHEN bi.DETAILTYPEID=5 THEN bi.MDURATION ELSE 1 END,
        e.QNTY_THRESHOLD,
        lc.USD,
        lc.CAD,
        lc.USD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / CASE WHEN bi.DETAILTYPEID=5 THEN bi.MDURATION ELSE 1 END,
        lc.CAD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / CASE WHEN bi.DETAILTYPEID=5 THEN bi.MDURATION ELSE 1 END,
        lc.NiCPrice,
        lc.element_id,
        lc.Parent,
        e.TYPE_NAME,
        b.batchID
    FROM 
        EntitlememntLOG e
    INNER JOIN 
        BatchAccounts b 
        ON EID=USERID AND b.batchID='${batchName}'
    INNER JOIN 
        BillingItemsAndEvents bi 
        ON bi.ACCOUNTID=EID AND e.BILLING_ITEM_ID=bi.BILLINGITEMID
    LEFT JOIN 
        CLicense lc 
        ON (
            e.ITEM_NAME=lc.ngbs_name
                OR e.EXT_PRODUCT_ID IN (${"'" + Exc.join("', '") + "'"})
            )
            AND e.EXT_PRODUCT_ID=lc.SKU 
            AND (e.TYPE_NAME='Recurring' AND lc.billing_type='Recurring'
                OR e.TYPE_NAME='Overage' AND lc.billing_type='Usage')
    WHERE
        (END_DATE > date('now') OR END_DATE IS NULL) 
        AND STATUS_NAME='Active'
    ORDER BY b.EID, e.EXT_PRODUCT_ID 
    `.replace(/\s+/g, " ");
  info = db.prepare(insertSql).run();
  console.log(`Entitlements inserted.`);
}

function selectEntitlementsSFDC(batchName) {
  const insertSql = `
  INSERT INTO BatchEntitlements
    (${flds.map((f) => f.name).join(", ")})
  SELECT
      b.EID,
      b.UID,
      b.BID,
      b.AccountName,
      e.CatID,
      lc.PRODUCT_NAME,
      e.EntitlementName,
      e.Price,
      CASE WHEN e.ChargeTerm='Annual' THEN 12 ELSE 1 END,
      e.Currency AS CURRENCY_CODE,
      (e.Price-e.Discount) / CASE WHEN e.ProductFamily!='Overage' AND e.ChargeTerm='Annual' THEN 12 ELSE 1 END,
      e.QuantityOrThreshold,
      lc.PRICE_USD,
      lc.PRICE_CAD,
      lc.PRICE_USD - (e.Price - e.Discount) / CASE WHEN e.ProductFamily!='Overage' AND e.ChargeTerm='Annual'  THEN 12 ELSE 1 END,
      lc.PRICE_CAD - (e.Price - e.Discount)  / CASE WHEN e.ProductFamily!='Overage' AND e.ChargeTerm='Annual'  THEN 12 ELSE 1 END,
      lc.NIC_PRICE,
      lc.L_CATEGORY,
      lc.PARENT,
      e.ProductFamily,
      '${batchName}'
  FROM 
      Entitlements_SFDC e
  INNER JOIN 
  BatchAccounts b 
      ON b.EID=e.EnterpriseAccountID AND b.batchID='${batchName}'
  LEFT JOIN 
      CatalogSFDC lc
      ON (
          e.EntitlementName=lc.PRODUCT_NAME
              OR e.CatID IN (${"'" + Exc.join("', '") + "'"})
          )
          AND e.CatID=lc.SKU 
          AND (e.ProductFamily!='Overage' AND lc.PRODUCT_FAMILY!='Overage'
              OR e.ProductFamily='Overage' AND lc.PRODUCT_FAMILY='Overage')
  ORDER BY b.EID, e.CatID`.replace(/\s+/g, " ");
  const info = db.prepare(insertSql).run();
  console.log(`${info} Inserted into BatchEntitlements table.`);
}

/**
 * createBatch - Creates and populate a batch table.
 * @batchName - Name of the batch to create.
 **/
export function createBatchEntitlementsSFDC(batchName) {
  prepareTable(batchName);
  selectEntitlementsSFDC(batchName);
  prepareBatchFiles(batchName);
}

export function createBatchEntitlements(batchName) {
  prepareTable(batchName);
  selectEntitlements(batchName);
  prepareBatchFiles(batchName);
}
