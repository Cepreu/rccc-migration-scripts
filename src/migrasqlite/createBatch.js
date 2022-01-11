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
        CREATE TABLE IF NOT EXISTS batch_items_(
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

    const deleteSql = `DELETE FROM batch_items_ WHERE batchID=?`

    const sql1 = `
        INSERT OR REPLACE 
        INTO batch_items_ 
	        SELECT 
                ?, 
                EnterpriseAccountID, 
                null, 
                null, 
                BUID,
                null,
                null
		    FROM nic_cases 
            INNER JOIN RAW_USA 
                ON BUID=InContactBUID 
		    GROUP BY BUID 
		    HAVING count(*) = 1 AND Subject LIKE 'NBU%' AND "No.ofInContactSeats" < 50
        `.replace(/\s+/g," ")

    const sql2 = `
        INSERT OR REPLACE
        INTO batch_items_
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
            console.log(`batch_items_ table was created (or existed): ${this.changes} rows changed`)
        })

        db.run(deleteSql, [batchName], function(err) {
            if (err) return console.log(err.message)
            console.log(`Number of rows deleted: ${this.changes} rows changed`)
        })

        db.run(sql2, [batchName], function(err) {
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