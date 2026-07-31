import { db } from "../utils/DBSingleton.js";
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
  { name: "PriceCAD", type: "NUMBER" },
  { name: "PriceAUD", type: "NUMBER" },
  { name: "PriceEUR", type: "NUMBER" },
  { name: "PriceGBP", type: "NUMBER" },
  { name: "DiscountUSD", type: "NUMBER" },
  { name: "DiscountCAD", type: "NUMBER" },
  { name: "DiscountAUD", type: "NUMBER" },
  { name: "DiscountEUR", type: "NUMBER" },
  { name: "DiscountGBP", type: "NUMBER" },
  { name: "NiCPrice", type: "NUMBER" },
  { name: "Category", type: "TEXT" },
  { name: "PARENT", type: "TEXT" },
  { name: "ProductFamily", type: "TEXT" },
  { name: "Ratio", type: "NUMBER" },
  { name: "batchID", type: "TEXT" },
];

function prepareTable(batchName: string) {
  let info = db
    .prepare(
      `CREATE TABLE IF NOT EXISTS BatchEntitlements (${flds
        .map((f) => f.name + " " + f.type)
        .join(", ")})`
    )
    .run();

  info = db
    .prepare(
      "DELETE FROM BatchEntitlements WHERE batchID=? OR batchID=?"
    )
    .run(batchName, `___${batchName}`);

  console.log(`BatchEntitlements. Number of rows deleted: ${info.changes}`);
}

function selectEntitlements(batchName: string) {
  const insertSql = `
    INSERT INTO BatchEntitlements
      (${flds.map((f) => f.name).join(", ")})
      WITH mapping AS (
        SELECT 
            CatalogSFDC.*,
            itbs_license_name,
            itbs_license_type,
            ngbs_package_id,
            ngbs_license_id,
            ratio
        FROM itbs_ngbs_maps
        JOIN CatalogSFDC ON ngbs_license_id='CCL_'||L_CATEGORY||'_'||No OR ngbs_license_id='CC_'||L_CATEGORY||'_'||No
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
                lc.PRICE_AUD,
                lc.PRICE_EUR,
                lc.PRICE_GBP,
                lc.PRICE_USD - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountUSD,
                lc.PRICE_CAD - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountCAD,
                lc.PRICE_AUD - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountAUD,
                lc.PRICE_EUR - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountEUR,
                lc.PRICE_GBP - (e.RETAIL_PRICE - e.DISCOUNT) * 1.0 / CASE WHEN e.ProductFamily!='Overage' THEN (e.MDURATION * ratio) ELSE 1.0 END AS discountGBP,
                lc.NIC_PRICE,
                lc.ngbs_license_id,
                lc.PARENT,
                e.ProductFamily,
                ratio,
               ?
        FROM 
          Entitlements_DWH e
          INNER JOIN BatchAccounts b 
              ON EID=USERID AND b.batchID=?
          LEFT JOIN mapping lc 
              ON (
                (UPPER(REPLACE(e.ITEM_NAME,CHAR(160),' '))=UPPER(lc.itbs_license_name) 
                OR e.ITEM_NAME=lc.itbs_license_name)
                AND (e.EXT_PRODUCT_ID=lc.SKU OR e.EXT_PRODUCT_ID is null and lc.SKU is null)
                AND e.ProductFamily=lc.itbs_license_type
                AND (
                    e.currency_code='USD' AND lc.ngbs_package_id=880 
                  OR e.currency_code='CAD' AND lc.ngbs_package_id=881
                  OR e.currency_code='AUD' AND lc.ngbs_package_id=2483005
                  OR e.currency_code='EUR' AND lc.ngbs_package_id=2565005
                  OR e.currency_code='GBP' AND lc.ngbs_package_id=2542005
                )
              )
        WHERE
          STATUS_NAME='Active'
          AND (END_DATE = '' OR END_DATE IS NULL OR END_DATE > date('now')) 
        ORDER BY b.EID, e.EXT_PRODUCT_ID     
    `.replace(/\s+/g, " "); /// COLLATE NOCASE
  const info = db.prepare(insertSql).run(batchName, batchName);
  console.log(
    `BatchEntitlements. Number of rows inserted: ${info.changes}`
  );
}
/*
                AND (
                    b.brand='RingCentral' AND lc.ngbs_package_id=880 
                  OR b.brand='RingCentral Canada' AND lc.ngbs_package_id=881
                  OR b.brand='RingCentral AU' AND lc.ngbs_package_id=2483005
                  OR b.brand='RingCentral EU' AND lc.ngbs_package_id=2565005
                  OR b.brand='RingCentral UK' AND lc.ngbs_package_id=2542005
                )
*/

/**
 * createBatch - Creates and populate a batch table.
 * @batchName - Name of the batch to create.
 **/
export function createBatchEntitlements(batchName: string, _billingMonth?: string) {
  prepareTable(batchName);
  selectEntitlements(batchName);
}
