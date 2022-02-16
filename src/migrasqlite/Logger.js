class Logger {
    static ERROR = 'ERROR'
    static WARNING = 'WARNING'
    static INFO = 'INFO'
    
    constructor(accountId) {
        this.accountId = accountId
        this.log = []
    }
    #logElem(severity, ruleName, description) {
        this.log.unshift(
            {
                severity: severity,
                rule: ruleName,
                issue: description, 
                account: this.accountId
            }
        )
    }

    logInfo(ruleName, description) {
        this.#logElem(Logger.INFO, ruleName, description)
    }
    logWarning(ruleName, description) {
        this.#logElem(Logger.WARNING, ruleName, description)
    }
    logError(ruleName, description) {
        this.#logElem(Logger.ERROR, ruleName, description)
    }
    errsAndWars() {
        return this.log.filter(p => p.severity === Logger.ERROR || p.severity === Logger.WARNING)
    }
}
module.exports = {Logger}