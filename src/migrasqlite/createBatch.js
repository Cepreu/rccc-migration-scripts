const sqlite3 = require('sqlite3').verbose()
const {DATABASE} = require('../configuration')

/** 
* createBatch - Creates and populate the batch table.
* @batchName - Name of the batch to create.
**/
exports.createBatch = (batchName) => {
    let db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Connected to DWH db.')
    })

    const createSql = `
        CREATE TABLE IF NOT EXISTS batch_items(
            batchID TEXT,
            EID INT UNIQUE,
            BID INT UNIQUE,
            UID INT UNIQUE,
            AccountName TEXT,
            brand TEXT,
            currency TEXT,

            PRIMARY KEY("EID")
        )
        `.replace(/\s+/g," ")

    const deleteSql = `DELETE FROM batch_items WHERE batchID=?`

    const sql1 = `
        INSERT OR REPLACE 
        INTO batch_items
            (batchID, EID, BID, UID, AccountName, brand, currency)
        SELECT 
            ?, 
            sf.EnterpriseAccountID, 
            sf.BillingID, 
            c2c.inContactBUID,
            sf.AccountName,
            sf.brand,
            sf.PriceperseatCurrency
        FROM 
            nic_cases c2c
        INNER JOIN 
            accounts_sfdc sf
            ON c2c.UID=sf.EnterpriseAccountID 
        WHERE
            sf.brand="RingCentral"
            AND sf.OutboundTransport LIKE 'RC Ad-Hoc%'
            AND UID not in (select  a.accountID from nic_case_items a where skuid LIKE '1265_-%') 
        GROUP BY UID 
        HAVING count(*) = 1 AND Subject LIKE 'NBU%' AND "No.ofInContactSeats" < 26
        `.replace(/\s+/g," ")

    const sql2 = `
        INSERT OR REPLACE
        INTO batch_items
            (batchID, EID, BID, UID, AccountName, brand, currency)
            SELECT 
                ?, 
                EnterpriseAccountID, 
                BillingID, 
                inContactBUID,
                AccountName,
                brand,
                PriceperseatCurrency
            FROM 
                accounts_sfdc 
            WHERE
                brand="RingCentral Canada"
    `.replace(/\s+/g, " ")

    db.serialize( () => {
        db.run(createSql, function(err) {
            if (err) return console.log(err.message)
            console.log(`batch_items table was created (or existed): ${this.changes} rows changed`)
        })

        db.run(deleteSql, [batchName], function(err) {
            if (err) return console.log(err.message)
            console.log(`Number of rows deleted: ${this.changes} rows changed`)
        })

        db.run(sql1, [batchName], function(err) {
            if (err) return console.log(err.message)
            console.log(`Number of rows inserted: ${this.changes} rows changed`)
        })
    })

    db.close( 
        (err) => {
            if (err) {
                return console.error(err.message)
            }
            console.log('Close the database connection.')
        })
}