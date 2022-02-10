const sqlite3 = require('sqlite3').verbose()
const {DATABASE} = require('../configuration')
const {write2excel} = require('./write2file')
const {Account} = require('./Account')
const {NgbsEntitlements, NiCEntitlements, CaseEntitlements} = require('./entitlements')
const RuleEngine = require('./RuleEngine')

const allAccounts = []
const ruleEngine = new RuleEngine()

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
            e.BID AS BILLING_ID,
            e.AccountName,
            batchID,
            b.brand AS BRANDNAME,
            b.currency AS CURRENCY,
            'MONTHLY' AS BILLING_TERM,
            'LEGACY' AS CATALOG
        FROM ngbs_ent e
        INNER JOIN batch_items b 
            ON b.EID=e.EID AND batchID=?
        ORDER BY e.AccountName
        `.replace(/\s+/g, " ")

    db.serialize( () => {
        db.each(
            sqlBatches,
            [batchName],
            (err, account) => {
                if (err) {
                    console.error(err.message)
                    throw err
                }
                db.all(NgbsEntitlements.SQL, [batchName, account.ENTERPRISE_ACCOUNT_ID], (err, ents) => {
                    if (err) {
                        console.error(err.message)
                        throw err
                    }
                    db.all(NiCEntitlements.SQL, [account.INCONTACT_BUID], (err, nics) => {
                        if (err) {
                            console.error(err.message)
                            throw err
                        }    
                        db.all(CaseEntitlements.SQL, [account.INCONTACT_BUID], (err, cases) => {
                            if (err) {
                                console.error(err.message)
                                throw err
                            }
                            console.log(account.ENTERPRISE_ACCOUNT_ID,account.INCONTACT_BUID, account.AccountName)
                            console.table(nics)
                            console.table(cases)
                        
                            const currAccount = new Account(account, ents, nics, cases, batchName)
                            currAccount.validateAndExport(ruleEngine)                       
                            allAccounts.push(currAccount)
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

/////////////////
const packageStat = (batchName) => {
//    allAccounts.sort((a,b) => (a.info.VALID & !b.info.VALID)? -1: !a.info.VALID & b.info.VALID? 1: 0)
    const errs = allAccounts.reduce((res, acc) => {res.push(...acc.errorsAndWarnings); return res}, [])
    write2excel(
        [
            {tab: "Accounts", data: allAccounts.reduce((res, acc) => {res.push(acc.info); return res}, [])},
            {tab: "ErrsAndWarns", data: errs}
        ],
        [batchName],
        'account_list'
        )
}
