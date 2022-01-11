const createCsvWriter = require('csv-writer').createObjectCsvWriter
const fs = require('fs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

const {checkItems, getGroupName} = require('./rules')

SPLIT = ''

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
        const ind = package.products.findIndex(p => p.name === e.name && p.chargeTerm === e.chargeTerm && p.skuId === e.skuId)
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
    //Write to DB: 
    writePackagesToDB(packages)
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

        let statement = db.prepare(insertSQL);
        // run the query over and over for each inner array
        for (let p = 0; p < packages.length; p++) {
            console.log(p,packages[p].name)
            for (let i = 0; i < packages[p].products.length; i++) {
                const lic = packages[p].products[i]
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
        }
        statement.finalize();
    })
   

    // close the database connection
    db.close()
}