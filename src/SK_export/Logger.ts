export const LOG_SEVERITIES = {
  ERROR: "ERROR",
  ALARM: "ALARM",
  WARNING: "WARNING",
  INFO: "INFO",
} as const;

export type LogSeverity = (typeof LOG_SEVERITIES)[keyof typeof LOG_SEVERITIES];

export interface LogEntry {
  severity: LogSeverity;
  rule: string;
  issue: string;
  account: string;
}

export class Logger {
  static readonly ERROR = LOG_SEVERITIES.ERROR;
  static readonly ALARM = LOG_SEVERITIES.ALARM;
  static readonly WARNING = LOG_SEVERITIES.WARNING;
  static readonly INFO = LOG_SEVERITIES.INFO;

  readonly accountId: string;
  readonly log: LogEntry[] = [];

  constructor(accountId: string) {
    this.accountId = accountId;
  }
  logElem(severity: LogSeverity, ruleName: string, description: string) {
    this.log.unshift({
      severity: severity,
      rule: ruleName,
      issue: description,
      account: this.accountId,
    });
    return true;
  }

  hasAlarm() {
    return this.log.some(
      ({ severity }) => severity === Logger.ALARM || severity === Logger.ERROR
    );
  }

  worstProblem() {
    const ea =
      this.log.find(({ severity }) => severity === Logger.ERROR) ||
      this.log.find(({ severity }) => severity === Logger.ALARM);
    return ea ? `${ea.severity}: ${ea.issue}` : "";
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
