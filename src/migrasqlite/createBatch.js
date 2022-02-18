const sqlite3 = require('sqlite3').verbose()
const {DATABASE} = require('../configuration')

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

const batchSqlPrefix = (batchName) => `
    INSERT OR REPLACE 
    INTO batch_items
        (batchID, EID, BID, UID, AccountName, brand, currency)
    SELECT 
        "${batchName.trim()}", 
        sf.EnterpriseAccountID, 
        sf.BillingID, 
        sf.inContactBUID,
        sf.AccountName,
        sf.brand,
        sf.PriceperseatCurrency
    FROM 
        accounts_sfdc sf`

        
const batchSQLs = {}

batchSQLs['nbu25'] = `
    INNER JOIN 
        nic_cases c2c
        ON c2c.UID=sf.EnterpriseAccountID 
    WHERE
        sf.brand="RingCentral"
        AND sf.OutboundTransport LIKE 'RC Ad-Hoc%'
        AND UID not in (select  a.accountID from nic_case_items a where skuid LIKE '1265_-%') 
    GROUP BY UID 
    HAVING count(*) = 1 AND Subject LIKE 'NBU%' AND sf."No.ofInContactSeats" < 26
    `

batchSQLs['Canada'] = 'WHERE sf.brand="RingCentral Canada"'

batchSQLs['test#1'] = 'WHERE sf.EnterpriseAccountID IN ("57060406","59424950")'


const getInsertSQL = (batchName) => {
    if (!batchSQLs.hasOwnProperty(batchName)) {
        console.log(`ERROR: "${batchName}" is incorrect batch name. Right names are: "${Object.keys(batchSQLs).join('", "')}"`) 
        return undefined
    }
    return (batchSqlPrefix(batchName) + ' ' + batchSQLs[batchName])
        .replace(/\s+/g, " ").trim()
}

/** 
* createBatch - Creates and populate the batch table.
* @batchName - Name of the batch to create.
**/
exports.createBatch = (batchName) => {
    const insertSQL = getInsertSQL(batchName)
    if (insertSQL === undefined) {
        return
    }

    let db = new sqlite3.Database(DATABASE, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Connected to DWH db.')
    })

    db.serialize( () => {
        db.run(createSql, function(err) {
            if (err) return console.log(err.message)
            console.log(`batch_items table was created (or existed): ${this.changes} rows changed`)
        })

        db.run(deleteSql, [batchName], function(err) {
            if (err) return console.log(err.message)
            console.log(`Number of rows deleted: ${this.changes} rows changed`)
        })

        db.run(insertSQL, function(err) {
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