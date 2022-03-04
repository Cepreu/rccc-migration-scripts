import {NgbsEntitlements, NiCEntitlements, CaseEntitlements} from './entitlements.mjs'
import {write2excel} from '../utils/write2file.mjs'
import {Logger} from './Logger.mjs'
import {db} from '../utils/DBSingleton.mjs'

export class Account {
    constructor (account, ents, nics, cases, batchName) {
        this.info = account
        this.nicEntsC2C = new CaseEntitlements(cases)
        this.ngbsEnts = new NgbsEntitlements(ents)
        this.nicEntsMRS = new NiCEntitlements(nics)
        this.batchName = batchName

        this.batchName = batchName
        this.info.VALID = true
        this.logger = new Logger(this.info.ENTERPRISE_ACCOUNT_ID)
        this.facts = {}

        this.invoiceLines = db.prepare('SELECT * FROM invoiceLines WHERE USERID=?').all(this.info.ENTERPRISE_ACCOUNT_ID)
    }
    get CURRENCY() {
        return this.info.CURRENCY
    }
    get ents() {return this.ngbsEnts.wrkColl}
    get nics() {return this.nicEntsMRS.wrkColl}
    get cases() {return this.nicEntsC2C.wrkColl}

    get errorsAndWarnings() {
        return this.logger.errsAndWars()
    }

    validateAndExport(ruleEngine) {
        this.info.VALID = ruleEngine.run(this)
        this.#finalize()
    }

    #finalize() {
        write2excel( 
            [
                {tab: "Account", data: [this.info]}, 
                {tab: "RC Entitlements", data: this.ngbsEnts.wrkColl, columns: ['Category', 'ITEM_NAME', 'QNTY_THRESHOLD', 'PRICE', 'DISCOUNT', 'CURRENCY']},
                {tab: "NiC Entitlements", data: this.nicEntsC2C.wrkColl},
                {tab: "Changelog", data: this.logger.log},
                {tab: "Raw DWH", data: this.ngbsEnts.originalColl},
                {tab: "Raw Monthly", data: this.nicEntsMRS.originalColl},
                {tab: "Raw Cases", data: this.nicEntsC2C.originalColl},
                {tab: "GroupedCases", data: this.nicEntsC2C.consColl},
                {tab: "Invoice", data: this.invoiceLines}
            ],
            [this.batchName], 
            this.info.ENTERPRISE_ACCOUNT_ID.toString() + (this.info.VALID? "": "_FAILED")
        )
        this.nicEntsC2C = null
        this.ngbsEnts = null
        this.nicEntsMRS = null
    }
    
    logInfo(ruleName, description) {
        this.logger.logInfo(ruleName, description)
    }
    logWarning(ruleName, description) {
        this.logger.logWarning(ruleName, description)
    }
    logError(ruleName, description) {
        this.logger.logError(ruleName, description)
    }
}
