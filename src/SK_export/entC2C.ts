import type { DataRows } from "../types.js";

////////////////////
export class CaseEntitlements {
  static SQL = `
      SELECT 
          accountID,
          BUID,
          SUBSTR(nic_cases.Subject, 1, 16) AS subject, 
          nic_cases.ProvisionDate, 
          sfdcCase,
          operation AS oper,
          skuid,
          sku,
          qtty,
          price
      FROM nic_cases, nic_case_items
      WHERE nic_cases.UID=?
      AND nic_cases.UID=accountID
      AND nic_cases.CaseNumber=sfdcCase
      ORDER BY 
          ProvisionDate DESC,
          cast(skuid as INTEGER)
      `.replace(/\s+/g, " ");

  readonly originalColl: DataRows;
  private c2c: DataRows;

  constructor(coll: DataRows) {
    this.originalColl = coll;
    this.c2c = this.consColl;
  }

  get wrkColl() {
    return this.c2c;
  }

  set wrkColl(newColl: DataRows) {
    this.c2c = newColl;
  }

  get consColl() {
    const replacements = {
      RC_STAN: "307-6-216",
      RC_PREM: "307-6-217",
    };

    const groupedCases = this.originalColl.reduce((acc, obj) => {
      const theLic =
        obj.skuid in replacements ? replacements[obj.skuid] : obj.skuid;

      const findInd = acc.findIndex((alreadyIn) => alreadyIn.skuid === theLic);
      if (findInd === -1) {
        acc.push({
          accountID: obj.accountID,
          BUID: obj.BUID,
          skuid: theLic,
          sku: obj.sku,
          price: obj.price,
          qtty: obj.qtty,
          oper: obj.oper,
        });
      } else {
        acc[findInd].qtty += obj.qtty;
        acc[findInd].oper = obj.oper; // last oparation
        if (acc[findInd].qtty === 0) {
          acc.splice(findInd, 1); // remove 0-qtty record if the license was removed
          //          console.log("Removed ", obj.skuid);
        }
      }
      return acc;
    }, []);

    return groupedCases.filter((cs) => cs.qtty !== -1);
  }
}
