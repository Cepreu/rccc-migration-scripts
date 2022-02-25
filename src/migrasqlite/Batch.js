const readLineSync = require('readline-sync')

const {DATABASE} = require('../configuration')
const db = require('better-sqlite3')(DATABASE, { verbose: console.log, fileMustExist: true, readonly: false})

class BatchDescription {
    static createTable() {
        db.prepare(`CREATE TABLE IF NOT EXISTS BatchDescription (
            name TEXT PRIMARY KEY,
            description TEXT,
            accSizeMin INTEGER,
            accSizeMax INTEGER,
            brand TEXT,
            telcoProvider TEXT,
            seatEdition TEXT,
            accountList TEXT,
            casesMin INTEGER,
            casesMax INTEGER,
            casesNBU TEXT,
            timestamp TEXT
        )
        `.replace(/\s+/g," "))
        .run()
    }

    constructor (name, description, 
                accSizeMin, accSizeMax, 
                brand, telcoProvider, seatEdition, 
                accountList=[], 
                saveFlag=true, 
                casesMin=0, casesMax=0, casesNBU=false) {
        this.name = name
        this.description = description        
        this.accSizeMin = accSizeMin
        this.accSizeMax = accSizeMax
        this.brand = brand
        this.telcoProvider = telcoProvider
        this.seatEdition = seatEdition
        this.accountList = accountList
        this.casesMin = casesMin,
        this.casesMax = casesMax,
        this.casesNBU = casesNBU

        if (saveFlag) {
            this.#saveToDB()
            this.#selectBatchAccounts()
        }
    }
////////////////
    static restoreFromDB (batchName) {
        const row = db
                    .prepare(`SELECT * from BatchDescription WHERE name=?`)
                    .get(batchName)
        if (row) {
            return new BatchDescription(row.name, row.description, 
                row.accSizeMin, row.accSizeMax, 
                row.brand, row.telcoProvider, row.seatEdition, 
                row.accountList? JSON.parse(row.accountList): [],
                false,
                row.casesMin, row.casesMax, row.casesNBU === 'true')
        }
        return undefined
    }
/////////
    #saveToDB() {
        BatchDescription.createTable()

        const stmt = db.prepare(
            `INSERT OR REPLACE INTO BatchDescription 
            (name, description, accSizeMin, accSizeMax, brand, telcoProvider, seatEdition, accountList, casesMin, casesMax, casesNBU, timestamp)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)

        const info = stmt.run( 
            this.name, this.description, this.accSizeMin, this.accSizeMax, 
            this.brand, this.telcoProvider, this.seatEdition,
            JSON.stringify(this.accountList),
            this.casesMin, this.casesMax, this.casesNBU.toString(),
            strftime('%Y-%m-%d %H:%M:%S','now')  
        )
        console.log(`Number of rows inserted: ${info.changes}`)
    }
/////////
    get #batchSQL() {
        const wheres = ['1=1']
        if (this.accSizeMin) {
            wheres.push(`sf."No.ofInContactSeats" >= ${this.accSizeMin}`)
        }
        if (this.accSizeMax) {
            wheres.push(`sf."No.ofInContactSeats" < ${this.accSizeMax}`)
        }
        wheres.push(this.brand? `sf.brand='${this.brand}'`: `(sf.brand='RingCentral' OR sf.brand='RingCentral Canada')`)
        if (this.telcoProvider) {
            if (this.telcoProvider==='RC') {
                wheres.push(`sf.OutboundTransport LIKE 'RC Ad-Hoc%'`)
            } else if (this.telcoProvider==='NiC') {
                wheres.push(`sf.OutboundTransport LIKE 'inContact Ad-Hoc%'`)
            } else {
                console.log('ERROR: batchSQLBuilder: telcoProvider should be "NiC" or "RC"')
                return null               
            }
        }
        if (this.seatEdition) {
            const inOrNot = this.seatEdition==='Legacy'? 'NOT IN': 'IN'
            wheres.push(`sf.EnterpriseAccountID ${inOrNot} (SELECT  a.accountID from nic_case_items a WHERE skuid LIKE '1265_-%')`)
        }
        if (this.accountList.length > 0) {
            wheres.push(`sf.EnterpriseAccountID IN (${this.accountList.join(",")})`)
        }    
        if (!this.name) {
            console.log('ERROR: batchSQLBuilder: batchName is undefined')
            return null
        }

        let inner_join = ''
        let group_by_having = ``

        if (this.casesMax > 0) {
            inner_join = `INNER JOIN nic_cases c2c ON c2c.UID=sf.EnterpriseAccountID`
            group_by_having = `GROUP BY UID HAVING COUNT(c2c.UID) >= ${this.casesMin} AND COUNT(c2c.UID) <= ${this.casesMax} `
            if (this.casesNBU) {
                group_by_having += ` AND COUNT(CASE WHEN Subject LIKE 'NBU%' THEN 1 END) >= 1`
            }
        }

        const sql = `
            INSERT OR REPLACE 
            INTO batch_items
                (batchID, EID, BID, UID, AccountName, brand, currency)
            SELECT 
                '${this.name}', sf.EnterpriseAccountID, sf.BillingID, sf.inContactBUID, sf.AccountName, sf.brand, sf.PriceperseatCurrency
            FROM 
                accounts_sfdc sf
                ${inner_join}
            WHERE
                ${wheres.join(' AND ')}
                ${group_by_having}
            `.replace(/\s+/g, " ").trim()

        return sql
    }
///////////////
    #selectBatchAccounts() {
        let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS batch_items(
            batchID TEXT,
            EID INT PRIMARY KEY,
            BID INT UNIQUE,
            UID INT UNIQUE,
            AccountName TEXT,
            brand TEXT,
            currency TEXT
        )`.replace(/\s+/g," "))
        let info = stmt.run()

        stmt = db.prepare(`DELETE FROM batch_items WHERE batchID=?`)
        info = stmt.run(this.name)
        console.log(`Number of rows deleted: ${info.changes}`)

        stmt = db.prepare(this.#batchSQL)
        info = stmt.run()
        console.log(`Number of rows inserted: ${info.changes}`)
    }
}


function BatchParametersMenu(batchName) {
    let batchDB
    if (batchName) {
        batchDB = BatchDescription.restoreFromDB(batchName)
    } else {
        batchName = readLineSync.question("Batch name: ")
        batchDB = new BatchDescription(batchName,'',0,10,'RingCentral','RC','Legacy',[],false,0,0,false)
    }

    let description = readLineSync.question(`Description [${batchDB.description}]: `) || batchDB.description
    let accSizeMin = readLineSync.question(`Account Size Min [${batchDB.accSizeMin}]: `) ||  batchDB.accSizeMin
    let accSizeMax = readLineSync.question(`Account Size Max [${batchDB.accSizeMax}]: `) ||  batchDB.accSizeMax
    let brand = readLineSync.question(`Brand(1=RingCentral, 2=RingCentral Canada, 3=1+2) [${batchDB.brand || 3}]: `)
    let telcoProvider = readLineSync.question(`telcoProvider(1=RC, 2=NiC,3=1+2)[${batchDB.telcoProvider || 3}]: `)
    let seatEdition = readLineSync.question(`Seat Edition Generation(1=Legacy, 2=NewGeneration, 3=1+2)[${batchDB.seatEdition || 3}]: `)
    let accountList = readLineSync.question(`Specific accounts, comma separated. ("x" to clear): [${batchDB.accountList}]: `).trim()
    let casesMin = readLineSync.question(`Min Number of cases [${batchDB.casesMin}]: `) || batchDB.casesMin
    let casesMax = readLineSync.question(`Max Number of cases [${batchDB.casesMax}]: `) ||  batchDB.casesMax
    let casesNBU = readLineSync.question(`Having NBU case [${batchDB.casesNBU?'Y':'N'}]: `) ||  batchDB.casesNBU? 'Y': 'N'
   
    return new BatchDescription(batchName, description, accSizeMin, accSizeMax, 
        brand==='1'? 'RingCentral': brand==='2'? 'RingCentral Canada': brand==='3'? undefined: batchDB.brand,
        telcoProvider==='1'? 'RC': telcoProvider==='2'? 'NiC': telcoProvider==='3'? undefined: batchDB.telcoProvider,
        seatEdition==='1'? 'Legacy': seatEdition==='2'? 'NewGeneration': seatEdition==='3'? undefined: batchDB.seatEdition, 
        accountList==='x'? []: accountList.length > 0? accountList.split(','): batchDB.accountList,
        true,
        casesMin, casesMax, casesNBU==='Y')
}

module.exports = {BatchDescription, BatchParametersMenu}