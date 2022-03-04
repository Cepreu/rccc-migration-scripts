import {db} from '../utils/DBSingleton.mjs'
import {write2excel} from '../utils/write2file.mjs'

const compileAccounts = (batchName, NgbsPackageId = 880, spendingLimitPercent = 1.5) => {
    const sql = `
    SELECT
        EnterpriseAccountID AS ENTERPRISE_ACCOUNT_ID,	
        BillingID AS BILLING_ACCOUNT_ID,
        dwh.ACCT_BRANDID,
        dwh.BRANDNAME,
        dwh.CURRENCY,
        dwh.INCONTACT_BUID,
        ? AS PACKAGE_ID,
        CASE MAX(bi.MDURATION) WHEN 1 THEN 'monthly' ELSE 'annual' END AS BILLING_TERM,
        ? AS SPENDING_LIMIT,
        accounts_sfdc."No.ofInContactSeats",
        nic.ContactCenterNumber,
        DefaultTimeZone,
        GeoRegion,
        ImplementationTeam
    FROM accounts_sfdc
        INNER JOIN batch_items b ON b.EID = EnterpriseAccountID
        INNER JOIN accounts_dwh dwh ON dwh.ACCOUNTID = EnterpriseAccountID
        INNER JOIN nic_cases nic ON nic.UID = EnterpriseAccountID
        LEFT JOIN BillingItemsAndEvents bi ON bi.ACCOUNTID = EnterpriseAccountID
    WHERE b.batchID=?
    GROUP BY EnterpriseAccountID
    `.replace(/\s+/g, " ")

    return db.prepare(sql).all(NgbsPackageId, spendingLimitPercent, batchName)
}

const compileEntitlements = (batchName) => {
    const sql = `
        SELECT e.* 
        FROM EntitlememntLOG e	
            INNER JOIN batch_items b ON e.USERID=b.EID
        WHERE b.batchID=?
            AND e.STATUS_NAME='Active'
            AND (e.END_DATE > date('now') OR e.END_DATE IS NULL) 
    `.replace(/\s+/g, " ")

    return db.prepare(sql).all(batchName)
}

const compileCases = (batchName) => {
    const sql = `
        SELECT c.* 
        FROM nic_case_items c
            INNER JOIN batch_items b ON c.accountID = b.EID
        WHERE b.batchID=?
        `.replace(/\s+/g, " ")

    return db.prepare(sql).all(batchName)
}


const compileRCMRSSummary = (batchName, invoiceDate='2021-12-01') => {
    const sql = `
        SELECT nic.* 
        FROM RCMRCSummary nic
            INNER JOIN batch_items b ON nic.Account = b.UID
        WHERE b.batchID = ? 
            AND nic.InvoiceDate = ?
        `.replace(/\s+/g, " ")

    return db.prepare(sql).all(batchName, invoiceDate)
}

export function upload_compiler(batchName) {
    const accounts = compileAccounts(batchName)
    const entitlemnents = compileEntitlements(batchName)
    const cases = compileCases(batchName)
    const nics = compileRCMRSSummary(batchName)

    write2excel(
        [
            {tab: "Accounts", data: accounts},
            {tab: "Entitlements", data: entitlemnents},
            {tab: "RCMRCSummary", data: nics},
            {tab: "CasesData", data: cases}
        ],
        [batchName, 'ICB'],
        `BATCH_${batchName}` 
    )
}
