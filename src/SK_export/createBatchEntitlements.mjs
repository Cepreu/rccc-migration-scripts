import { db } from "../utils/DBSingleton.mjs";
import { prepareBatchFiles } from "./prepareBatchFiles.mjs";

const Exc = [
  "308-8-167",
  "309-11-171",
  "309-11-172", // Contact Center: [(-)Additional ]Active Storage (per GB for concurrent user)  Overage
  "309-565-000",
  "310-557-000", // Contact Center: PCI Level 1 Seat License - Add On (per Named-User Seat Edition) [+ Overage]
  "500-617-000",
  "1012-150-000", // Contact Center: [(-)Service: Additional Local DID][(+)US Local Number]
  "1032-173-000",
  "1032-174-000",
  "1032-175-000",
  "1032-487-000",
  "1032-493-000",
  "1032-494-000",
  "1032-572-000",
  "1032-573-000", // Contact Center: Outbound SMS Application Fee [(-)- Canada][(+) Canada (per BU)]
  "1032-574-000", // Contact Center: Inbound SMS Application Fee [(-)- Canada][(+) Canada (per BU)]
  "1270-136-000", // Contact Center: Service: [(-)Additional][(+)US] Toll Free Number
  "1500-000-000", // Contact Center: [(-)inContact ]Social Media[(+) Channel]
  "1503-693-000",
  "1503-694-000",
  "1561-50-000", // Contact Center: Care [(+)Plus ]Monthly Success Package[(-) (99 users)]
  "1561-55-000", // Contact Center: Premier Monthly Success Package [(-)(250 users)][+(up to 249 users)]
  "3347-21-000", // Contact Center: [(+)inContact ]Agent for Salesforce
  "3465-22-000", // Contact Center: [(-)inView ]Performance Management (per Named-User)
  "3465-521-000", // Contact Center: [(+)Performance Management -][(-)InView] Gamification (per Named-User)
  "3465-523-000", // Contact Center: [(+)inView ][(-)Performance Management -] Coaching and Learning Management[(-) (per Named-User)]
  "3465-1227-000",
  "4058-000-000", // Contact Center[(-) ]: inContact Screen Recording
  "4100-533-000", // Contact Center: [(-)NICE ]Workforce Management Essentials
  "4100-534-000", // Contact Center: [(-)Workforce Management Advanced][(+)IEX WFM Integrated Advanced (per Named-User)]
  "4100-701-000",
  "4101-537-000", // Contact Center: Workforce [(-)Optimization Advanced][(+)Engagement (WEM) Integrated Advanced (per Named-User)]
  "4101-643-000", // Contact Center: Workforce [(-)Optimization Pro (per named-user)][(+)Engagement Management (per Named-User)]
  "4102-538-000", // Contact Center: [(-)Quality Management Enterprise][(+)QM Integrated] (per Named-User)
  "4102-539-000", // Contact Center: [(-)NICE Quality Management][(+)Quality Optimization Integrated (per Named-User)]
  "4102-642-000", // Contact Center: Quality Management[(-) Pro] with Voice Recording (per [(-)named-user)[(+)Named-User])
  "4102-829-000", // Contact Center: Quality Management Analytics[(+) Pro] (per Named-User)
  "4104-541-000", // Contact Center: [(-)Screen Recording][(+)Integrated Screen Recording (per Named-User)]
  "4104-644-000", // Contact Center: Screen Recording Pro (per [(-)named-user][(+)Configured User])
  "4105-542-000", // Contact Center: [(+)IEX WFM Integrated - ]Workload Manager[(+) (per Named-User)]
  "4106-543-000", // Contact Center: [(+)Integrated][(-)Audio] Recording (per Named-User)"
  "4107-645-000", // Contact Center: Audio Recording [(-)Advanced][(+) Pro] (per Named-User)
  "4108-561-000", // Contact Center: [(-)Omnichannel Analytics][(+)Interaction Analytics (per Named-User)]
  "4109-673-000", // Contact Center: Interaction Analytics - Data Ingest API
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
        lc.PRODUCT_NAME,
        e.ITEM_NAME,
        e.RETAIL_PRICE,
        e.MDURATION,
        e.CURRENCY_CODE,
        (e.RETAIL_PRICE-e.DISCOUNT_VALUE) / CASE WHEN e.ProductFamily!='Overage' THEN e.MDURATION ELSE 1 END,
        e.QNTY_THRESHOLD,
        lc.PRICE_USD,
        lc.PRICE_CAD,
        lc.PRICE_USD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / CASE WHEN e.ProductFamily!='Overage' THEN e.MDURATION ELSE 1 END,
        lc.PRICE_CAD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / CASE WHEN e.ProductFamily!='Overage' THEN e.MDURATION ELSE 1 END,
        lc.NIC_PRICE,
        lc.L_CATEGORY,
        lc.PARENT,
        e.ProductFamily,
        '${batchName}'
    FROM 
        Entitlements_DWH e
    INNER JOIN 
        BatchAccounts b 
        ON EID=USERID AND b.batchID='${batchName}'
    LEFT JOIN 
    CatalogSFDC lc 
        ON (
            e.ITEM_NAME=lc.PRODUCT_NAME
                OR e.EXT_PRODUCT_ID IN (${"'" + Exc.join("', '") + "'"})
            )
            AND e.EXT_PRODUCT_ID=lc.SKU 
            AND (e.ProductFamily!='Overage' AND lc.PRODUCT_FAMILY!='Overage'
            OR e.ProductFamily='Overage' AND lc.PRODUCT_FAMILY='Overage')
  WHERE
        (END_DATE > date('now') OR END_DATE IS NULL) 
        AND STATUS_NAME='Active'
    ORDER BY b.EID, e.EXT_PRODUCT_ID 
    `.replace(/\s+/g, " ");
  const info = db.prepare(insertSql).run();
  console.log(`${info} Inserted into BatchEntitlements table.`);
}

////// [Deprecated!]
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
export function createBatchEntitlements(batchName) {
  prepareTable(batchName);
  selectEntitlementsSFDC(batchName); ////<====
  prepareBatchFiles(batchName);
}
