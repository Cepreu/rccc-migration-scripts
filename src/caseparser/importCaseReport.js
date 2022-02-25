const csv = require('csv-parser')
const fs = require('fs')
const path = require('path')
const date = require('date-and-time')

const {DATABASE, C2CPATH} = require('../configuration')
const db = require('better-sqlite3')(DATABASE, { verbose: console.log, fileMustExist: true, readonly: false})

exports.importCaseReport = reportName => {
    db
    .prepare(`
        CREATE TABLE IF NOT EXISTS nic_cases (
            CreatedDate	TEXT,
            ICCaseNumber	INTEGER,
            inContactBUID	INTEGER,
            UID	INTEGER,
            AccountName	TEXT,
            Subject	TEXT,
            OrderNumber	INTEGER,
            OrderID	TEXT,
            CaseNumber	INTEGER,
            Description	TEXT,
            SubmittedDate	TEXT,
            ProvisionDate	TEXT,
            OrderType	TEXT,
            Status	TEXT,
            OpportunityName	TEXT,
            SalesAgreementName	TEXT,
            Brand	TEXT,
            DBInserted TEXT,
        PRIMARY KEY("ICCaseNumber")
        )`.replace(/\s+/g, " "))
    .run()

    const insrow = db.prepare(`
        INSERT OR IGNORE INTO nic_cases (
            CreatedDate, 
            ICCaseNumber, 
            inContactBUID,
            UID,
            AccountName,
            Subject,
            OrderNumber,
            OrderID,
            CaseNumber,
            Description,
            SubmittedDate,
            ProvisionDate,
            OrderType,
            Status,
            OpportunityName,
            SalesAgreementName,
            Brand,
            DBInserted)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
        .replace(/\s+/g, " "))

    const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')

    fs.createReadStream(path.resolve(C2CPATH, reportName))
            .pipe(csv({"separator": ","}))
            .on('data', row => {
                console.log(row)
                if (row["IC Case Number"] !== '') {
                    insrow.run( 
                        `${date.transform(row["Created Date"], 'M/D/YYYY', 'YYYY-MM-DD')}`,
                        row["IC Case Number"],
                        row["inContact BU ID"],
                        row["Account (UID)"],
                        row["Account Name: Account Name"],
                        row["Subject"],
                        row["Order Number"],
                        row["Order ID"],
                        row["Case Number"],
                        row["Description"],
                        row["Submitted Date"],
                        `${date.transform(row["Provision Date"], 'M/D/YYYY', 'YYYY-MM-DD')}`,
                        row["Order Type"],
                        row["Status"],
                        row["Opportunity: Opportunity Name"],
                        row["Sales Agreement: Sales Agreement Name"],
                        row["Brand"],
                        now
                        )
                }
            })
            .on('end', () => {
                console.log('C2C successfully processed')
                db.close()
            })
}