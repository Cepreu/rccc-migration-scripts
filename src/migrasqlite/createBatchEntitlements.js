const {DATABASE} = require('../configuration')
const db = require('better-sqlite3')(DATABASE, { verbose: console.log, fileMustExist: true, readonly: false})

/** 
 * createBatch - Creates and populate a batch table.
 * @batchName - Name of the batch to create.
 **/
exports.createBatchEntitlements = (batchName) => {
    const tableName = `BATCH_${batchName}_ents`

    let info =  db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run()
    console.log(`Removed table: ${tableName}.`)

    const createSql = `
    CREATE TABLE ${tableName} AS
        SELECT DISTINCT
            b.EID,
            b.UID,
            b.BID,
            b.AccountName,
            e.EXT_PRODUCT_ID,
            e.ITEM_NAME,
            e.RETAIL_PRICE,
            bi.MDURATION,
            bi.CURRENCY_CODE,
            (e.RETAIL_PRICE-e.DISCOUNT_VALUE) / CASE WHEN bi.DETAILTYPEID=5 THEN bi.MDURATION ELSE 1 END AS OldPrice,
            e.QNTY_THRESHOLD,
            lc.USD AS PriceUSD,
            lc.CAD AS Price,
            lc.USD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / CASE WHEN bi.DETAILTYPEID=5 THEN bi.MDURATION ELSE 1 END AS DiscountUSD,
            lc.CAD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / CASE WHEN bi.DETAILTYPEID=5 THEN bi.MDURATION ELSE 1 END AS Discount,
            lc.NiCPrice AS NiCPrice,
            lc.element_id AS Category,
            lc.Parent,
            e.TYPE_NAME AS ProductFamily
        FROM 
            EntitlememntLOG e
        INNER JOIN 
            batch_items b 
            ON EID=USERID AND batchID=?
        INNER JOIN 
            BillingItemsAndEvents bi 
            ON bi.ACCOUNTID=EID AND e.BILLING_ITEM_ID=bi.BILLINGITEMID
        LEFT JOIN 
            CLicense lc 
            ON (
                e.ITEM_NAME=lc.ngbs_name
                    OR e.EXT_PRODUCT_ID IN ('4100-701-000', '1503-693-000', '1503-694-000', '4109-673-000', '500-617-000', '308-8-167', '3465-1227-000')
                )
                AND e.EXT_PRODUCT_ID=lc.SKU 
                AND (e.TYPE_NAME='Recurring' AND lc.billing_type='Recurring'
                    OR e.TYPE_NAME='Overage' AND lc.billing_type='Usage')
        WHERE
            (END_DATE > date('now') OR END_DATE IS NULL) 
            AND STATUS_NAME='Active'
        ORDER BY b.EID, e.EXT_PRODUCT_ID 
    `.replace(/\s+/g," ")
    info = db.prepare(createSql).run(batchName)
    console.log(`${tableName} table was created.`)
}
