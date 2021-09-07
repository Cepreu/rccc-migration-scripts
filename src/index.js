const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
//const Configstore = require('configstore')
const { build_packages_SQL } = require('./cataloguer')
const readLineSync = require('readline-sync')
//const { build_feeds } = require('./migrafeeder')
const { createBatch, prepareBatchFile } = require('./migrasqlite/prepareBatch')

clear()
console.log(
    chalk.yellow(
        figlet.textSync('Migra-2', {horizontalLayout: 'full'})
    )
)

    console.log("1) Catalogs")
    console.log("2) Create Batch")
    console.log("3) Entitlementss")

    const userRes = readLineSync.question("Pick an option: ")
    if (userRes === '1') {
        build_packages_SQL()
    } else if (userRes === '2') {
        createBatch('Batch01')
    } else if (userRes === '3') {
        prepareBatchFile('Batch01')
    }
    console.log("G'buy")
