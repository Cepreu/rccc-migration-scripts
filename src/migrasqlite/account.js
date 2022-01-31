const {NgbsEntitlements, NiCEntitlements, CaseEntitlements} = require('./entitlements')
const {rules, ERROR, WARNING} = require('./rules')
const {write2excel} = require('./write2file')

class Account {
    constructor (account, ents, nics, cases, batchName) {
        this.info = account
        this.nicEntsC2C = new CaseEntitlements(cases)
        this.ngbsEnts = new NgbsEntitlements(ents)
        this.nicEntsMRS = new NiCEntitlements(nics)
        this.batchName = batchName

        this.batchName = batchName
        this.info.VALID = true
        this.problems = []
    }

    get errorsAndWarnings() {
        const ew = this.problems.filter(p => p.severity === ERROR || p.severity === WARNING)
        ew.forEach((pe, i, arr) => arr[i].account = this.info.ENTERPRISE_ACCOUNT_ID)
        return ew
    }

    validateAndExport() {
        this.#applyRules()
        this.#finalize()
    }

    #applyRules () {  
        let skipRules = false
        rules.forEach( rule => {
            if (!skipRules) {
                rule.reset()
                console.log(rule.description)
                const res = rule.action(this.ngbsEnts.wrkColl, this.nicEntsMRS.wrkColl, this.nicEntsC2C.wrkColl)
                this.problems.unshift(...rule.logItems)
                if (!res) {
                    this.info.VALID = false
                    skipRules = true
                }
            }
        })
    }

    #finalize() {
        write2excel( 
            [
                {tab: "Account", data: [this.info]}, 
                {tab: "RC Entitlements", data: this.ngbsEnts.wrkColl, columns: ['Category', 'ITEM_NAME', 'QNTY_THRESHOLD', 'PRICE', 'DISCOUNT']},
                {tab: "NiC Entitlements", data: this.nicEntsC2C.wrkColl},
                {tab: "Changelog", data: this.problems},
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
}

module.exports = {Account: Account}