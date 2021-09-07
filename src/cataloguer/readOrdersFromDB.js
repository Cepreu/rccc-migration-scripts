const sqlite3 = require('sqlite3').verbose()

const {packetizer} = require('./packetizer')
const {isSeatEdition} = require('./rules')

const sql = `
SELECT 
    USERID,
    ITEM_NAME,
    ent.EXT_PRODUCT_ID,
    TYPE_NAME,
    MAX(RETAIL_PRICE-DISCOUNT_VALUE) AS MaxPrice,
    MAX(RETAIL_PRICE*bi.MDURATION-DISCOUNT_VALUE) AS MaxPrice12,
    bi.MDURATION
FROM EntitlementLOG_USA AS ent
    INNER JOIN BILLINGITEMS_USA AS bi 
        ON BILLINGITEMID=BILLING_ITEM_ID
WHERE 
    STATUS_NAME='Active' 
    AND (END_DATE IS NULL OR END_DATE > datetime())

GROUP BY 
    USERID,
    ITEM_NAME, 
    ent.EXT_PRODUCT_ID,
    TYPE_NAME,
    MDURATION
`
//////////////////////
// prepareCatalogs
//////////////////////
exports.prepareCatalogs = (handleResultFunc) => {
    let db = new sqlite3.Database('../../dwh', sqlite3.OPEN_READONLY, (err) => {
        if (err) return console.error(err.message)
        console.log('Connected to DWH db.')
    })

    const order = {CustomerID: null, entitlements: []}
    const packages = []

    db.each(
        sql,
        (err, data) => {
            if (err) console.error(err.message)

            const e = {
                skuId: data.EXT_PRODUCT_ID, 
                name: data.ITEM_NAME,
                type: data.TYPE_NAME,
                price: parseFloat(data.MaxPrice),
                price12: parseFloat(data.MaxPrice12),
                chargeTerm: parseInt(data.MDURATION)
            }
            if (order.CustomerID === data.USERID) {
                if (isSeatEdition(e.name)) {
                    order.entitlements.unshift(e) // make it first
                } else {
                    order.entitlements.push(e)
                }
            } else {
                if (order.CustomerID) packetizer(order, packages)
                order.CustomerID = data.USERID
                order.entitlements = [e]
            }          
        },
        (err,num) => {
            packetizer(order, packages); // last order
            handleResultFunc(packages)
            db.close( (err) => {
                if (err) return console.error(err.message)
                console.log('Close the database connection.')
            })
        }
    )
    handleResultFunc(packages)
}


