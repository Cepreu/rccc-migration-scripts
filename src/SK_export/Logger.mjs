export class Logger {
  static ERROR = "ERROR";
  static ALARM = "ALARM";
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

  hasAlarm() {
    return !!this.log.find((p) => p.severity === Logger.ALARM);
  }

  errsAndWars() {
    return this.log.filter(
      (p) =>
        p.severity === Logger.ERROR ||
        p.severity === Logger.ALARM ||
        p.severity === Logger.WARNING
    );
  }
}
