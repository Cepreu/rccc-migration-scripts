import readLineSync from 'readline-sync'
import {EntitlementsLOG} from './entitlementLOG.mjs'
import {Invoices, InvoiceLines} from './invoices.mjs'
import {RCMRCSummary} from './RCMRCSummary.mjs'
import {Catalog} from './Catalog.mjs'

console.log("1) Entitlements")
console.log("2) Invoices")
console.log("3) RCMRCSummary")
console.log("4) Catalog")

const userRes = readLineSync.question("Pick an option: ")
if (userRes === '1') {
    EntitlementsLOG()
} else if (userRes === '2') {
    Invoices()
    InvoiceLines()
} else if (userRes === '3') {
    RCMRCSummary()
} else if (userRes === '4') {
    Catalog()
} 
console.log("G'buy")