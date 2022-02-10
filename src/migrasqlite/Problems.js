class Problems {
    static ERROR = 'ERROR'
    static WARNING = 'WARNING'
    static INFO = 'INFO'
    
    constructor(accountId) {
        this.accountId = accountId
        this.log = []
    }
    logInfo(ruleName, description) {
        this.log.push({severity: Problems.INFO, rule: ruleName, issue: description, account: this.accountId})
    }
    logWarning(ruleName, description) {
        this.log.push({severity: Problems.WARNING, rule: ruleName, issue: description, account: this.accountId})
    }
    logError(ruleName, description) {
        this.log.push({severity: Problems.ERROR, rule: ruleName, issue: description, account: this.accountId})
    }
    errsAndWars() {
        return this.log.filter(p => p.severity === Problems.ERROR || p.severity === Problems.WARNING)
    }
}
module.exports = {Problems}