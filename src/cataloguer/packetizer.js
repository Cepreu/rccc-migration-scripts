const createCsvWriter = require('csv-writer').createObjectCsvWriter
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const {areMutuallyExclusive, getGroupName} = require('./rules')

SPLIT = ''

const checkItems = (entitlement, packageItem) => {
    let res = 'nomatch'
    if (entitlement.name === packageItem.name) {
        if (entitlement.skuId === packageItem.skuId) {
            if (entitlement.chargeTerm === packageItem.chargeTerm ) {
                res = (entitlement.price >= packageItem.price || entitlement.price12 >= packageItem.price12)? 'pricey': 'match'
            }
        } else {
            res = 'split'
        }
    } else if (areMutuallyExclusive(entitlement.name, packageItem.name)) {
        res = 'rule'
    }
    return res
}

const checkIfMatches = (package, order) => {
    const additions = []
    for (ent of order.entitlements) {
        let fullMatch = false
        find_prod:
        for (pi of package.products) {
            switch (checkItems(ent, pi)) {
                case 'split':
                    SPLIT += ` >> ${pi.name}: ${order.CustomerID}:${ent.skuId} / ${package.name}:${pi.skuId}`
                    console.log(SPLIT)
                case 'rule':
                    return false

                case 'match':
                    fullMatch = true
                case 'pricey':
                    SPLIT = ''
                    break find_prod

                default:
                    break
            }
        }
        if (fullMatch) continue
        additions.push(ent)
    }

    additions.forEach( e => {
        const ind = package.products.findIndex(p => p.name === e.name && p.chargeTerm === e.chargeTerm)
        if (ind > -1) {
            if (package.products[ind].price < e.price) package.products[ind].price = e.price
            if (package.products[ind].price12 < e.price12) package.products[ind].price12 = e.price12
        } else {
            package.products.push(e)
        }
    })

    return true
}

const createNewPackage = (pname, order) => {
    const package = {
        name: pname + '_' + getGroupName(order.entitlements[0].name),
        trace: SPLIT,
        products: []
    }
    SPLIT = ''
    package.orders = [order.CustomerID]
    for (ent of order.entitlements) {
        package.products.push( ent )
    }
    return package
}
exports.packetizer = (order, packages) => {
    const i = packages.findIndex( p => checkIfMatches(p, order));
    if (i > -1) {
        packages[i].orders.push(order.CustomerID)
    } else {
        packages.push( createNewPackage("package" + packages.length, order) )
    }
}

exports.handleResult = (packages) => {

 

    //JSON file:
    fs.writeFileSync(path.resolve(process.cwd(), 'results', 'all_packages.json'), JSON.stringify(packages,null,'\t'))
 
    //CSV files:
    let filesWritten = 0
    packages.map( p => {
        const csvWriter = createCsvWriter({
            path: path.resolve(process.cwd(), "results", p.name + '.csv'),
            header: [
                {id: 'skuId', title: 'EXT_PRODUCT_ID'},
                {id: 'name', title: 'ITEM_NAME'},
                {id: 'type', title: 'TYPE_NAME'},
                {id: 'chargeTerm', title: 'CHARGE_TERM'},
                {id: 'price', title: 'CATALOG_PRICE'},
                {id: 'price12', title: 'CATALOG_PRICE_ANNUAL'}
            ]
        })
        csvWriter
            .writeRecords(p.products)
            .then(() => {
                filesWritten++
                if (filesWritten == packages.length) {
                    console.log (`${filesWritten} files created`)
                    writePackagesToDB(packages)
                }
            })
            .catch(error => console.error(error))
    })



}

/*****
 * Insert packages to DB
 **/
const writePackagesToDB = (packages) => {
    let db = new sqlite3.Database('../../dwh', sqlite3.OPEN_READWRITE, (err) => {
        if (err) return console.error(err.message)
        console.log('Connected to DWH db.')
    })

    const createTable = `
CREATE TABLE IF NOT EXISTS packages(
    PACKAGE TEXT,
    EXT_PRODUCT_ID TEXT,
    ITEM_NAME TEXT,
    TYPE_NAME TEXT,
    CHARGE_TERM text,
    CATALOG_PRICE NUMBER,
    CATALOG_PRICE_ANNUAL NUMBER
)`

    const insertSQL = `
INSERT INTO packages(
    PACKAGE,
    EXT_PRODUCT_ID,
    ITEM_NAME,
    TYPE_NAME,
    CHARGE_TERM,
    CATALOG_PRICE,
    CATALOG_PRICE_ANNUAL
) VALUES (
    ?, ?, ?, ?, ?, ?, ?
)`

// 'prepare' returns a 'statement' object which allows us to 
// bind the same query to different parameters each time we run it

    db.serialize(() => {
        db.run(createTable, [], (err) => {
            if (err) return console.log(err.message)
        })
        db.run("DELETE FROM packages", (err) => {
            if (err) return console.log(err.message)
        })

        const p=11
        let statement = db.prepare(insertSQL);
        // run the query over and over for each inner array
        for (let i = 0; i < packages[p].products.length; i++) {
            const lic = packages[p].products[i]
            console.log(i,lic.skuId)
            statement.run(
                [   packages[p].name, 
                    lic.skuId,
                    lic.name,
                    lic.type,
                    lic.chargeTerm,
                    lic.price,
                    lic.price12
                ], 
                (err) => {if (err) console.log(err);}
            )
        } 
        statement.finalize();
    })
   

    // close the database connection
    db.close()
}