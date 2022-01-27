const sqlite3 = require('sqlite3').verbose()
const {DATABASE} = require('../configuration')

/** 
* createBatch - Creates and populate a batch table.
* @batchName - Name of the batch to create.
**/
exports.createBatchEntitlements = (batchName) => {
    let db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Connected to DWH db.')
    })

    const dropTableSql = `
        DROP TABLE IF EXISTS ngbs_ent
        `.replace(/\s+/g," ")

    const createSql = `
    CREATE TABLE ngbs_ent AS
        SELECT DISTINCT
            b.EID,
            b.UID,
            b.AccountName,
            e.EXT_PRODUCT_ID,
            e.ITEM_NAME,
            e.RETAIL_PRICE,
            bi.MDURATION,
            (e.RETAIL_PRICE-e.DISCOUNT_VALUE) / bi.MDURATION AS OldPrice,
            e.QNTY_THRESHOLD,
            lc.USD AS PriceUSD,
            lc.CAD AS Price,
            lc.USD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / bi.MDURATION AS DiscountUSD,
            lc.CAD - (e.RETAIL_PRICE - e.DISCOUNT_VALUE) / bi.MDURATION AS Discount,
            lc.NiCPrice AS NiCPrice,
            lc.element_id AS Category,
            lc.billing_type AS ProductFamily
        FROM 
            EntitlememntLOG e
        INNER JOIN 
            batch_items b 
            ON EID=USERID AND batchID=?
        INNER JOIN 
            BillingItemsAndEvents bi 
            ON e.BILLING_ITEM_ID=bi.BILLINGITEMID
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

    db.serialize( () => {
        db.run(dropTableSql, [], function(err) {
            if (err) {
                console.log(err.message)
                return
            }
            console.log(`Removed table: ${this.drop}`)
        })

        db.run(createSql, [batchName], (err) => {
            if (err) {
                console.log(err.message)
                return
            }
            console.log(`ngbs_ent table was created (or existed)`)
        })

        db.close( 
            (err) => {
                if (err) {
                    console.log(err.message)
                    return
                }
                console.log('Close the database connection.')
            }
        )
    })
}