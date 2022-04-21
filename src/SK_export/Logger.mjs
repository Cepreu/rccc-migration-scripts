export class Logger {
  static ERROR = "ERROR";
  static WARNING = "WARNING";
  static INFO = "INFO";

  constructor(accountId) {
    this.accountId = accountId;
    this.log = [];
  }
  logElem(severity, ruleName, description) {
    this.log.unshift({
      severity: severity,
      rule: ruleName,
      issue: description,
      account: this.accountId,
    });
    return true;
  }

  errsAndWars() {
    return this.log.filter(
      (p) => p.severity === Logger.ERROR || p.severity === Logger.WARNING
    );
  }
}
