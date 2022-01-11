const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
//const Configstore = require('configstore')
const { build_packages_SQL } = require('./cataloguer')
const readLineSync = require('readline-sync')
//const { build_feeds } = require('./migrafeeder')
const { createBatch } = require('./migrasqlite/createBatch')
const { createBatchEntitlements } = require('./migrasqlite/createBatchEntitlements')
const { prepareBatchFile } = require('./migrasqlite/prepareBatch')

clear()
console.log(
    chalk.yellow(
        figlet.textSync('Migra-2', {horizontalLayout: 'full'})
    )
)

    console.log("1) Create Batch")
    console.log("2) Entitlements")
    console.log("3) Prepare import")

    const batchName = readLineSync.question("Batch name: ")
    const userRes = readLineSync.question("Pick an option: ")
    if (userRes === '1') {
        createBatch(batchName)
    } else if (userRes === '2') {
        createBatchEntitlements(batchName)
    } else if (userRes === '3') {
        prepareBatchFile(batchName)
    }
    console.log("G'buy")
