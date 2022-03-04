import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
//const Configstore = require('configstore')
import readLineSync from 'readline-sync'
import { createBatchEntitlements } from './accounts/createBatchEntitlements.mjs'
import { prepareBatchFile } from './accounts/prepareBatch.mjs'
import { BatchParametersMenu } from './batch/Batch.mjs'

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
 //       BatchItems(batchName)
    } else if (userRes === '2') {
        createBatchEntitlements(batchName)
    } else if (userRes === '3') {
        prepareBatchFile(batchName)
    } else if (userRes === '4') {
        console.log( BatchParametersMenu() )
    } else if (userRes === '5') {
        console.log( BatchParametersMenu(batchName) )
    }
    console.log("G'buy")
