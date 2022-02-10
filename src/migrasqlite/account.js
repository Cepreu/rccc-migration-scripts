const {NgbsEntitlements, NiCEntitlements, CaseEntitlements} = require('./entitlements')
const {write2excel} = require('./write2file')
const {Problems} = require('./Problems')

class Account {
    constructor (account, ents, nics, cases, batchName) {
        this.info = account
        this.nicEntsC2C = new CaseEntitlements(cases)
        this.ngbsEnts = new NgbsEntitlements(ents)
        this.nicEntsMRS = new NiCEntitlements(nics)
        this.batchName = batchName

        this.batchName = batchName
        this.info.VALID = true
        this.logger = new Problems(this.info.ENTERPRISE_ACCOUNT_ID)
        this.facts = {}
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
                {tab: "GroupedCases", data: this.nicEntsC2C.consColl}
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

module.exports = {Account}