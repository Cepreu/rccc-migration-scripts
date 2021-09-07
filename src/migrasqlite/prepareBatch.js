const path = require('path')
const fs1 = require('fs-extra')
const sqlite3 = require('sqlite3').verbose()

/** 
* createBatch - Creates and populate a batch table.
* @batchName - Name of the batch to create.
**/
exports.createBatch = (batchName) => {
    let db = new sqlite3.Database('../../dwh', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Connected to DWH db.')
    })

    const createSql = `
CREATE TABLE IF NOT EXISTS "MIGRATION_BATCHES" (
    "BATCH_NAME"	TEXT NOT NULL,
    "ACCOUNT_ID"	TEXT NOT NULL,
    "MIGRATION_DATE"	TEXT,
    "NOTE"	TEXT,
    "INCONTACT_ID"	TEXT,
    PRIMARY KEY("BATCH_NAME","ACCOUNT_ID"))
`

    const deleteSql = `DELETE FROM MIGRATION_BATCHES WHERE BATCH_NAME=?`

    const sql1 = `
INSERT OR REPLACE INTO MIGRATION_BATCHES 
	SELECT ?, EnterpriseAccountID, null, null,BUID 
		FROM nic_cases INNER JOIN RAW_USA ON BUID=InContactBUID 
		GROUP BY BUID 
		HAVING count(*) = 1 AND Subject LIKE 'NBU%' AND "No.ofInContactSeats" < 50
`

    db.serialize( () => {
        db.run(createSql, (err) => {
            if (err) return console.log(err.message)
            console.log(`MIGRATION_BATCHES table created or exists`);
        })

        db.run(deleteSql, [batchName], (err) => {
            if (err) return console.log(err.message)
            console.log(`Number of rows deleted: ${this.deleted}`);
        })

        db.run(sql1, [batchName], function(err) {
            if (err) return console.log(err.message)
            console.log(`Number of rows inserted: ${this.changes}`);
        })


    })

    db.close( (err) => {
        if (err) return console.error(err.message)
        console.log('Close the database connection.')
    })
}

//////////////////////
// prepereBatchFile
//////////////////////
exports.prepareBatchFile = (batchName) => {
    let db = new sqlite3.Database('../../dwh', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            return console.error(err.message)
        }
        console.log('Connected to DWH db.')
    })

    const sqlBatches = `SELECT ACCOUNT_ID FROM MIGRATION_BATCHES WHERE BATCH_NAME =? LIMIT 2`
    const sqlEntitlements = `SELECT * FROM EntitlementLOG_USA WHERE USERID=? LIMIT 12`
    db.serialize( () => {
        db.each(
            sqlBatches,
            [batchName],
            (err, row) => {
                if (err) {
                    console.error(err.message)
                }
                db.all(sqlEntitlements, [row.ACCOUNT_ID], (err, ents) => {
                    if (err) throw err
                    write2file(batchName, row.ACCOUNT_ID, ents)
                })
            },
            (err,num) => {
                db.close( (err) => {
                    if (err) return console.error(err.message)
                    console.log('Close the database connection.')
                })
            }
        )
    })
}

const write2file = (batchName, accountID, entitlements) => { 
    const dir = path.resolve(process.cwd(), 'results', batchName)
    fs1.ensureDirSync(dir)
    fs1.writeFile(path.resolve(dir, "" + accountID), JSON.stringify(entitlements, null, '\t'))
}