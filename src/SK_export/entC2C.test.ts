import assert from "node:assert/strict";
import test from "node:test";

import { CaseEntitlements } from "./entC2C.js";

test("case entitlements normalize legacy SKUs and combine quantities", () => {
  const source = [
    {
      accountID: "100",
      BUID: "200",
      skuid: "RC_STAN",
      sku: "Standard seat",
      price: 20,
      qtty: 3,
      oper: "ADD",
    },
    {
      accountID: "100",
      BUID: "200",
      skuid: "RC_STAN",
      sku: "Standard seat",
      price: 20,
      qtty: -1,
      oper: "REDUCE",
    },
  ];

  const entitlements = new CaseEntitlements(source);

  assert.deepEqual(entitlements.wrkColl, [
    {
      accountID: "100",
      BUID: "200",
      skuid: "307-6-216",
      sku: "Standard seat",
      price: 20,
      qtty: 2,
      oper: "REDUCE",
    },
  ]);
  assert.equal(source[0].skuid, "RC_STAN");
});

test("case entitlements remove licenses whose resulting quantity is zero", () => {
  const entitlements = new CaseEntitlements([
    { skuid: "sku-1", qtty: 1, oper: "ADD" },
    { skuid: "sku-1", qtty: -1, oper: "REDUCE" },
  ]);

  assert.deepEqual(entitlements.wrkColl, []);
});
