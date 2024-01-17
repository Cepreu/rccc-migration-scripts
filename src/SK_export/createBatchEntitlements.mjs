import { db } from "../utils/DBSingleton.mjs";
const flds = [
  { name: "EID", type: "TEXT" },
  { name: "UID", type: "TEXT" },
  { name: "BID", type: "TEXT" },
  { name: "AccountName", type: "TEXT" },
  { name: "ID", type: "TEXT" },
  { name: "EXT_PRODUCT_ID", type: "TEXT" },
  { name: "ITEM_NAME", type: "TEXT" },
  { name: "ITBS_NAME", type: "TEXT" },
  { name: "RETAIL_PRICE", type: "NUMBER" },
  { name: "MDURATION", type: "INTEGER" },
  { name: "CURRENCY_CODE", type: "TEXT" },
  { name: "OldPrice", type: "NUMBER" },
  { name: "OldQntyThreshold", type: "INTEGER" },
  { name: "QNTY_THRESHOLD", type: "INTEGER" },
  { name: "PriceUSD", type: "NUMBER" },
  { name: "Price", type: "NUMBER" },
  { name: "DiscountUSD", type: "NUMBER" },
  { name: "Discount", type: "NUMBER" },
  { name: "NiCPrice", type: "NUMBER" },
  { name: "Category", type: "TEXT" },
  { name: "PARENT", type: "TEXT" },
  { name: "ProductFamily", type: "TEXT" },
  { name: "Ratio", type: "NUMBER" },
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
    .prepare(
      `DELETE FROM BatchEntitlements WHERE batchID='${batchName}' OR batchID='___${batchName}'`
    )
    .run();

  console.log(`Deleted from BatchEntitlements.`);
}

function selectEntitlements(batchName) {
  prepareTable(batchName);

  const insertSql = `
    INSERT INTO BatchEntitlements
      (${flds.map((f) => f.name).join(", ")})
      WITH mapping AS (
        SELECT 
            CatalogSFDC.*,
            itbs_license_name,
            itbs_license_type,
            ngbs_license_id,
            ratio
        FROM itbs_ngbs_maps
        JOIN CatalogSFDC ON ngbs_license_id='CCL_'||L_CATEGORY||'_'||No OR ngbs_license_id='CC_'||L_CATEGORY||'_'||No
        WHERE ngbs_package_id=880
        )
        SELECT DISTINCT
                b.EID,
                b.UID,
                b.BID,
                b.AccountName,
                e.ID,
                e.EXT_PRODUCT_ID,
                lc.PRODUCT_NAME,
                e.ITEM_NAME,
                e.RETAIL_PRICE,
                e.MDURATION,
                e.CURRENCY_CODE,
                (e.RETAIL_PRICE-e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN e.MDURATION ELSE 1 END,
                e.QNTY_THRESHOLD,
                e.QNTY_THRESHOLD * ratio,
                lc.PRICE_USD,
                lc.PRICE_CAD,
                lc.PRICE_USD - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountUSD,
                lc.PRICE_CAD - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountCA,
                lc.NIC_PRICE,
                lc.ngbs_license_id,
                lc.PARENT,
                e.ProductFamily,
                ratio,
               '${batchName}'
        FROM 
          Entitlements_DWH e
          INNER JOIN BatchAccounts b 
              ON EID=USERID AND b.batchID='${batchName}'
          LEFT JOIN mapping lc 
              ON (
                UPPER(REPLACE(e.ITEM_NAME,CHAR(160),' '))=UPPER(lc.itbs_license_name)
                AND (e.EXT_PRODUCT_ID=lc.SKU OR e.EXT_PRODUCT_ID is null and lc.SKU is null)
                AND e.ProductFamily=lc.itbs_license_type
              )
        WHERE
          STATUS_NAME='Active'
          AND (END_DATE = '' OR END_DATE IS NULL OR END_DATE > date('now')) 
        ORDER BY b.EID, e.EXT_PRODUCT_ID     
    `.replace(/\s+/g, " "); /// COLLATE NOCASE
  const info = db.prepare(insertSql).run();
  console.log(`${info} Inserted into BatchEntitlements table.`);
}

/**
 * createBatch - Creates and populate a batch table.
 * @batchName - Name of the batch to create.
 **/
export function createBatchEntitlements(batchName) {
  prepareTable(batchName);
  selectEntitlements(batchName);
}
