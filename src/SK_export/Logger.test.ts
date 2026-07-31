import assert from "node:assert/strict";
import test from "node:test";

import { Logger } from "./Logger.js";

test("errors and alarms mark an account as needing attention", () => {
  const alarmLogger = new Logger("account-1");
  alarmLogger.logElem(Logger.ALARM, "invoice", "Invoice total differs");

  assert.equal(alarmLogger.hasAlarm(), true);
  assert.equal(
    alarmLogger.worstProblem(),
    "ALARM: Invoice total differs"
  );

  const errorLogger = new Logger("account-2");
  errorLogger.logElem(Logger.ERROR, "catalog", "Catalog mapping missing");

  assert.equal(errorLogger.hasAlarm(), true);
  assert.equal(
    errorLogger.worstProblem(),
    "ERROR: Catalog mapping missing"
  );
});

test("informational entries do not mark an account as alarmed", () => {
  const logger = new Logger("account-3");
  logger.logElem(Logger.INFO, "migration", "Account processed");

  assert.equal(logger.hasAlarm(), false);
  assert.deepEqual(logger.errsAndWars(), []);
});
