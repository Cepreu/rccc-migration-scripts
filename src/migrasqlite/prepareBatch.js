const sqlite3 = require('sqlite3').verbose()
const {DATABASE} = require('../configuration')
const {rules} = require('./rules')
const {write2excel, write2json} = require('./write2file')
const {NgbsEntitlements, NiCEntitlements, CaseEntitlements} = require('./entitlements')

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

    db.serialize( () => {
        db.each(
            sqlBatches,
            [batchName],
            (err, row) => {
                if (err) {
                    console.error(err.message)
                    throw err
                }
                db.all(NgbsEntitlements.SQL, [batchName, row.ENTERPRISE_ACCOUNT_ID], (err, ents) => {
                    if (err) {
                        console.error(err.message)
                        throw err
                    }
                    db.all(NiCEntitlements.SQL, [row.INCONTACT_BUID], (err, nics) => {
                        if (err) {
                            console.error(err.message)
                            throw err
                        }    
                        db.all(CaseEntitlements.SQL, [row.INCONTACT_BUID], (err, cases) => {
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

    const nicEntsC2C = new CaseEntitlements(cases)
    const ngbsEnts = new NgbsEntitlements(ents)
    const nicEntsMRS = new NiCEntitlements(nics)

    const problems = applyRules(account, ngbsEnts, nicEntsMRS, nicEntsC2C)

    allAccounts.push(account)
    
    write2excel( 
        [
            {tab: "Account", data: [account]}, 
            {tab: "RC Entitlements", data: ngbsEnts.wrkColl, columns: ['Category', 'ITEM_NAME', 'QNTY_THRESHOLD', 'PRICE', 'DISCOUNT']},
            {tab: "NiC Entitlements", data: nicEntsC2C.wrkColl},
            {tab: "Changelog", data: problems},
            {tab: "Raw DWH", data: ngbsEnts.originalColl},
            {tab: "Raw Monthly", data: nicEntsMRS.originalColl},
            {tab: "Raw Cases", data: nicEntsC2C.originalColl},
//            {tab: "GroupedCases", data: groupCases(cases)}
        ],
        [batchName], 
        account.ENTERPRISE_ACCOUNT_ID.toString() + (account.VALID? "": "_FAILED")
    )
}

/////////////////
const packageStat = (batchName) => {
    allAccounts.sort((a,b) => (a.VALID & !b.VALID)? -1: !a.VALID & b.VALID? 1: 0)
    write2excel(
        [{tab: "Accounts", data: allAccounts}],
        [batchName],
        'account_list'
        )
}

const applyRules = (account, ents, nics, cases) => {
    const problems = []
    account["VALID"] = true

    let skipRules = false
    rules.forEach( rule => {
        if (!skipRules) {
            rule.reset()
            console.log(rule.description)
            const res = rule.action(ents.wrkColl, nics.wrkColl, cases.wrkColl)
            problems.unshift(...rule.logItems)
            if (!res) {
                account["VALID"] = false
                skipRules = true
            }
        }
    })

    return problems
}