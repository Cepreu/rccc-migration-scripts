import readLineSync from 'readline-sync'
import {EntitlementsLOG} from './entitlementLOG.mjs'
import {Invoices, InvoiceLines} from './invoices.mjs'
import {RCMRCSummary} from './RCMRCSummary.mjs'

console.log("1) Entitlements")
console.log("2) Invoices")
console.log("3) RCMRCSummary")

const userRes = readLineSync.question("Pick an option: ")
if (userRes === '1') {
    EntitlementsLOG()
} else if (userRes === '2') {
    Invoices()
    InvoiceLines()
} else if (userRes === '3') {
    RCMRCSummary()
} 
console.log("G'buy")