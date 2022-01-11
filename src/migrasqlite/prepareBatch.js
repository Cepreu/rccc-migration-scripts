const sqlite3 = require('sqlite3').verbose()
const {DATABASE} = require('../configuration')
const {applyRules} = require('./rules')
const {write2excel, write2json} = require('./write2file')
const allAccounts = []

//////////////////////
// prepareBatchFile
//////////////////////
exports.prepareBatchFile = (batchName) => {
    let db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Connected to DWH db.')
    })

    const sqlBatches = `
        SELECT DISTINCT 
            e.EID AS ENTERPRISE_ACCOUNT_ID,
            e.UID AS INCONTACT_BUID,
            e.AccountName,
            batchID,
            'RingCentral Canada' AS BRANDNAME,
            'CAD' AS CURRENCY,
            'MONTHLY' AS BILLING_TERM,
            'LEGACY' AS CATALOG
        FROM ngbs_ent e
        INNER JOIN batch_items b ON b.EID=e.EID AND batchID=?
        ORDER BY e.AccountName
        `.replace(/\s+/g, " ")

    const sqlEntitlements = `
        SELECT 
            EXT_PRODUCT_ID,
            Category,
            ITEM_NAME,QNTY_THRESHOLD,
            round(PRICE,2) PRICE,
            round(Discount,2) DISCOUNT,
            round(NiCPrice,2) NiCPrice,
            Price CAT_PRICE,
            ProductFamily,
            ? AS batchID
        FROM ngbs_ent
        WHERE eid=?
        ORDER BY AccountName, QNTY_THRESHOLD DESC, cast(EXT_PRODUCT_ID AS INTEGER), EXT_PRODUCT_ID, Category
        `.replace(/\s+/g, " ")

    const sqlMonthly = `
        SELECT 
            CatalogID || "-" || IFNULL(FeatureID,"000") || "-" || IFNULL(FeatureDetailID,"000") AS SKU,
            Product,
            Quantity,
            Amount,
            Amount/Quantity AS Price
        FROM RCMRCSummary_20211001
        WHERE Account=?
            AND ProductType="MRC"
        ORDER BY cast(CatalogID as INTEGER), CatalogID
        `.replace(/\s+/g, " ")

    const sqlCase2Case = `
        SELECT 
            SUBSTR(nic_cases.Subject, 1, 16) AS subject, 
            nic_cases.ProvisionDate, 
            sfdcCase,operation AS oper,
            skuid,
            sku,
            qtty,
            price
        FROM nic_cases, nic_case_items
        WHERE nic_cases.inContactBUID=?
            AND nic_cases.CaseNumber=sfdcCase
        ORDER BY 
            ProvisionDate DESC,
            cast(skuid as INTEGER)
        `.replace(/\s+/g, " ")


    db.serialize( () => {
        db.each(
            sqlBatches,
            [batchName],
            (err, row) => {
                if (err) {
                    console.error(err.message)
                    throw err
                }
                db.all(sqlEntitlements, [batchName, row.ENTERPRISE_ACCOUNT_ID], (err, ents) => {
                    if (err) {
                        console.error(err.message)
                        throw err
                    }
                    db.all(sqlMonthly, [row.INCONTACT_BUID], (err, nics) => {
                        if (err) {
                            console.error(err.message)
                            throw err
                        }    
                        db.all(sqlCase2Case, [row.INCONTACT_BUID], (err, cases) => {
                            if (err) {
                                console.error(err.message)
                                throw err
                            }
                            validateAndExport(row, ents, nics, cases, batchName)
                        })
                    })
                })
            },
            (err,num) => {
                db.close( (err) => {
                    packageStat(batchName)
                    
                    if (err) return console.error(err.message)
                    console.log('Close the Database Connection.')
                })
            }
            )
    })
}
    
/////////////////////////////////
const validateAndExport = (account, ents, nics, cases, batchName) => {
    
    console.log(account.ENTERPRISE_ACCOUNT_ID,account.INCONTACT_BUID, account.AccountName)
    console.table(nics)
    console.table(cases)
    const nicEnts = groupCases(cases)

    const problems = applyRules(account, ents, nics, nicEnts)

    allAccounts.push(account)
    
    write2excel( 
        [
            {tab: "Account", data: [account]}, 
            {tab: "RC Entitlements", data: ents},
            {tab: "NiC Entitlements", data: nicEnts},
            {tab: "Changelog", data: problems},
            {tab: "Raw DWH", data: ents},
            {tab: "Raw Monthly", data: nics},
            {tab: "Raw Cases", data: cases},
            {tab: "GroupedCases", data: groupCases(cases)}
        ],
        [batchName], 
        account.ENTERPRISE_ACCOUNT_ID.toString()
    )
}

const groupCases = (cases) => {
    return cases.reduce( (acc, obj) => {
        const findObj = acc.find(alreadyIn => alreadyIn.skuid === obj.skuid)
        if (findObj === undefined) {
            acc.push({skuid: obj.skuid, sku: obj.sku, price: obj.price, qtty: obj.qtty})
        } else {
            findObj.qtty += obj.qtty
        }
        return acc
    }, [])
}

/////////////////
const packageStat = (batchName) => {
    write2excel(
        [{tab: "Accounts", data: allAccounts}],
        [batchName],
        'account_list'
        )
}
