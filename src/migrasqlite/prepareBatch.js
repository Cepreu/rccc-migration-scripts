const {DATABASE} = require('../configuration')
const db = require('better-sqlite3')(DATABASE, { verbose: console.log, fileMustExist: true, readonly: false})

const {write2excel} = require('../utils/write2file')
const {Account} = require('./Account')
const {NgbsEntitlements, NiCEntitlements, CaseEntitlements} = require('./entitlements')
const RuleEngine = require('./RuleEngine')

const allAccounts = []
const ruleEngine = new RuleEngine()

//////////////////////
// prepareBatchFile
//////////////////////
exports.prepareBatchFile = (batchName) => {
    const tableName = `BATCH_${batchName}_ents`
    const stmt = db.prepare(
        `SELECT DISTINCT 
            e.EID AS ENTERPRISE_ACCOUNT_ID,
            e.UID AS INCONTACT_BUID,
            e.BID AS BILLING_ID,
            e.AccountName,
            batchID,
            b.brand AS BRANDNAME,
            b.currency AS CURRENCY,
            'MONTHLY' AS BILLING_TERM,
            'LEGACY' AS CATALOG
        FROM ${tableName} e
        INNER JOIN batch_items b 
            ON b.EID=e.EID AND batchID=?
        ORDER BY e.AccountName`
        .replace(/\s+/g, " "))

    for (const account of stmt.iterate(batchName)) {
        const stmt = db.prepare(`
            SELECT 
            EXT_PRODUCT_ID,
            Category,
            ITEM_NAME,
            QNTY_THRESHOLD,
            OldPrice,
            CASE CURRENCY_CODE WHEN 'USD' THEN round(PRICEUSD,2) WHEN 'CAD' THEN round(PRICE,2) END PRICE,
            CASE CURRENCY_CODE WHEN 'USD' THEN round(DiscountUSD,2) WHEN 'CAD' THEN round(Discount,2) END DISCOUNT,
            CURRENCY_CODE AS CURRENCY,
            round(NiCPrice,2) NiCPrice,
            ProductFamily,
            Parent,
            ? AS batchID
        FROM ${tableName}
        WHERE eid=?
        ORDER BY AccountName, QNTY_THRESHOLD DESC, cast(EXT_PRODUCT_ID AS INTEGER), EXT_PRODUCT_ID, Category
        `.replace(/\s+/g, " "))
               
        const ents = stmt.all(batchName, account.ENTERPRISE_ACCOUNT_ID)
        const nics = db.prepare(NiCEntitlements.SQL).all(account.INCONTACT_BUID)
        const cases = db.prepare(CaseEntitlements.SQL).all(account.INCONTACT_BUID)

        console.log(account.ENTERPRISE_ACCOUNT_ID,account.INCONTACT_BUID, account.AccountName)
        console.table(nics)
        console.table(cases)
    
        const currAccount = new Account(account, ents, nics, cases, batchName)
        currAccount.validateAndExport(ruleEngine)                       
        allAccounts.push(currAccount)
    }

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
