import { Rule } from "./RuleEngine.mjs";
import { Legacy } from "./LegacyCatalog.mjs";
const RECURRING = "Recurring";
const OVERAGE = "Overage";

//////////////////
class C2CStripXX extends Rule {
  static {
    super.Register(
      "RC: Removes the _XX suffix in C2C (to enable further matching)"
    );
  }
  action(acct) {
    const listXX = acct.cases
      .filter((c) => c.skuid.slice(-3) === "-XX")
      .map((x) => x.skuid);
    if (listXX.length) {
      acct.cases.forEach((c2c) => (c2c.skuid = c2c.skuid.replace(/\-XX$/, "")));
      acct.logWarning(
        this.name,
        `Removed "-XX" suffix in the following c2c sku(s): ${listXX.join(", ")}`
      );
    }
    return true;
  }
}

/////////////
class CheckAccInfo extends Rule {
  static {
    super.Register("Checks correctness of email and phone in the account info");
  }
  action(acct) {
    const email_templ =
      /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-.]+.[a-zA-Z0-9-]{2,}$|^$/;
    const phone_templ =
      /^(\+?\d{1,3}\s?)?([\(-]?\d{3}?[\)-]?)?[\s.-]?\d{3}[\s.-]?\d{4}$|^$/;
    if (
      (acct.info.email == null || acct.info.email.match(email_templ)) &&
      (acct.info.phone == null || acct.info.phone.match(phone_templ))
    ) {
      return true;
    }
    acct.logError(
      this.name,
      `Incorrect email (${acct.info.email}) or phone (${acct.info.phone})`
    );
    return false;
  }
}

/////////////
class CheckNiCAcc extends Rule {
  static {
    super.Register("Checks if NiC account # in Accounts matches Cases");
  }
  action(acct) {
    acct.cases
      .filter((c2c) => c2c.BUID != acct.info.INCONTACT_BUID)
      .forEach((cs) => {
        acct.logWarning(
          this.name,
          `Fixed NiC account id in Cases (${cs.BUID}) to match one in Accounts (${acct.info.INCONTACT_BUID})`
        );
        cs.BUID = acct.info.INCONTACT_BUID;
      });
    return true;
  }
}

/////////////
class CasesNBU extends Rule {
  static {
    super.Register(
      "Checks if we have all the cases (i.e. can we rely on the cases)"
    );
  }
  action(acct) {
    if (!acct.facts.NBU) {
      acct.logWarning(this.name, "NBU case wasn't not found");
    }
    return true;
  }
}

/////////////
class RCCheckSeats extends Rule {
  static {
    super.Register("Checks for the existence and uniqueness of a Seat license");
  }
  action(acct) {
    const isReccurentSeat = (ent) => {
      return (
        Legacy.IsSeat(ent.EXT_PRODUCT_ID) && ent.ITEM_NAME !== "Seat Overage"
        //&&
        //ent.OldQntyThreshold > 0
      );
    };
    const seats = acct.ents.filter((ent) => isReccurentSeat(ent));
    if (seats.length !== 1) {
      acct.logError(
        this.name,
        seats.length === 0
          ? "Seat licenses not found"
          : `More than one seat licenses were found: ${seats.map(
              (s) => s.EXT_PRODUCT_ID
            )}`
      );
      return false;
    }
    acct.facts.seat = seats[0];
    return true;
  }
}

/////////////
class RCCSeatOverage extends Rule {
  static {
    super.Register("Checks/Fixes Seat Overage license");
  }
  #stripName(strippedSeatName) {
    const x = strippedSeatName.match(/ \d+ \- \d+/);
    return x ? strippedSeatName.replace(x[0], "") : strippedSeatName;
  }
  action(acct) {
    const strippedSeatName = this.#stripName(acct.facts.seat.ITEM_NAME);
    acct.facts.seatOverage = acct.ents.find(
      (row) =>
        row.EXT_PRODUCT_ID === acct.facts.seat.EXT_PRODUCT_ID &&
        row.ITEM_NAME === "Seat Overage" &&
        row.OldQntyThreshold > 0 &&
        row.PARENT === strippedSeatName
    );

    if (acct.facts.seatOverage === undefined) {
      const SOLic = Legacy.seatOverageMap.find(
        (l) => l.PARENT === strippedSeatName
      );
      if (!SOLic) {
        acct.logError(
          this.name,
          `INTERNAL ERROR: Parent: ${strippedSeatName} - not found`
        );
        return false; // (shouldn't happen)
      }
      acct.facts.seatOverage = {
        ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
        EXT_PRODUCT_ID: SOLic.EXT_PRODUCT_ID,
        Category: SOLic.Category,
        ITEM_NAME: "Seat Overage",
        QNTY_THRESHOLD: 0,
        OldQntyThreshold: acct.facts.seat.OldQntyThreshold,
        PRICE: acct.facts.seat.CURRENCY ? SOLic.PRICE_USD : SOLic.PRICE_CAD,
        DISCOUNT: 0,
        NiCPrice: acct.facts.seat.NiCPrice,
        CURRENCY: acct.facts.seat.CURRENCY,
        ProductFamily: OVERAGE,
        batchID: "",
      };
      acct.ents.push(acct.facts.seatOverage);
      acct.logWarning(
        this.name,
        `Seat overage license was not found. Added: ${
          acct.facts.seatOverage.Category
        } $${acct.facts.seatOverage.PRICE - acct.facts.seatOverage.DISCOUNT}`
      );
    }

    // Cleanup of extra seat overages if any
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          Legacy.IsSeat(e.EXT_PRODUCT_ID) &&
          ((e.Category !== acct.facts.seatOverage.Category &&
            e.Category !== acct.facts.seat.Category) ||
            e.OldQntyThreshold == 0) &&
          acct.logInfo(
            this.name,
            `Removed: ${e.EXT_PRODUCT_ID} ${e.ITEM_NAME}, parent "${e.PARENT}", qtty ${e.OldQntyThreshold}`
          )
        )
    );
    return true;
  }
}

//////////
class RCPorts4Seats extends Rule {
  static {
    super.Register(
      "Checks if the Additional Port licenses matches the Seat license"
    );
  }
  action(acct) {
    return (
      Legacy.portMap.hasOwnProperty(acct.facts.seatOverage.Category) ||
      !acct.logError(
        this.name,
        `Unknown port2seat mapping: ${acct.facts.seatOverage.Category}`
      )
    );
  }
}

/////////////
class RCFixPorts extends Rule {
  static {
    super.Register("Check/Fix Port Overage license");
  }
  action(acct) {
    const entPorts = acct.ents.filter(
      (row) =>
        /^308-/.test(row.EXT_PRODUCT_ID) && row.ProductFamily === "Overage"
    );

    if (entPorts.length === 0) {
      const supposedPort = (
        acct.cases.find((c2c) => /^308-/.test(c2c.skuid)) || {
          skuid: "308-8-215",
        }
      ).skuid;
      entPorts.push(
        Rule.AddEntitlement({
          acct,
          sku: supposedPort,
          qtty: 0,
          productFamily: OVERAGE,
          correctICB: true,
        })
      );
      acct.logWarning(
        this.name,
        `${supposedPort} - missed port overage entitlement was added`
      );

      Rule.AddCase({
        account: acct,
        skuid: supposedPort,
        qtty: 0,
        addNiC: true,
      });
      acct.logWarning(
        this.name,
        `${supposedPort} - missed port overage entitlement was added  to case2case`
      );
    }
    const expectedPortBySeat = entPorts.find(
      (e) =>
        !!Legacy.portMap[acct.facts.seatOverage.Category].find(
          (p) => p === e.Category
        )
    );
    if (expectedPortBySeat !== undefined) {
      acct.facts.entPortLic = expectedPortBySeat;
    } else {
      acct.logWarning(
        this.name,
        `No proper PortOverage found for ${acct.facts.seatOverage.Category}. Selected ${entPorts[0].Category} (${entPorts[0].EXT_PRODUCT_ID})`
      );
      acct.facts.entPortLic = entPorts[0];
    }
    // remove extra port lics:
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          e.EXT_PRODUCT_ID === acct.facts.entPortLic.EXT_PRODUCT_ID &&
          e.Category !== acct.facts.entPortLic.Category &&
          acct.logInfo(
            this.name,
            `Removed ephemeral port ${e.Category ? e.Category : ""}: ${
              e.EXT_PRODUCT_ID
            } ${e.ITBS_NAME}`
          )
        )
    );

    return true;
  }
}

/////////////
class NiCPorts extends Rule {
  static {
    super.Register("Checks NiC Ports");
  }
  action(acct) {
    if (acct.facts.entPortLic) {
      const nicPort = acct.nics.find((nic) => /^308-/.test(nic.SKU));
      if (!!nicPort && nicPort.SKU !== acct.facts.entPortLic.EXT_PRODUCT_ID) {
        acct.logAlarm(
          this.name,
          `NiC Port license ${nicPort.SKU} doesn't match RC entitlements: ${acct.facts.entPortLic.EXT_PRODUCT_ID}`
        );
      }
    }
    return true;
  }
}

/////////////
class C2CPorts extends Rule {
  static {
    super.Register("Checks C2C Ports");
  }
  action(acct) {
    if (acct.facts.entPortLic) {
      const casePorts = acct.cases.filter((c) => /^308-/.test(c.skuid));
      if (!casePorts.length) {
        Rule.AddCase({
          account: acct,
          skuid: acct.facts.entPortLic.EXT_PRODUCT_ID,
          sku: "Additional Configured Universal Port",
          qtty: 0,
          price: acct.facts.entPortLic.NiCPrice,
        });
        acct.logWarning(
          this.name,
          `C2C Port Overage license was not found. Added ${acct.facts.entPortLic.EXT_PRODUCT_ID} from Entitlements`
        );
      } else {
        casePorts.forEach((casePort) => {
          if (
            casePort.skuid !== acct.facts.entPortLic.EXT_PRODUCT_ID &&
            !acct.ents.find(
              (row) =>
                row.EXT_PRODUCT_ID === casePort.skuid &&
                row.ProductFamily === RECURRING
            )
          ) {
            acct.logWarning(
              this.name,
              `NiC Port license ${casePort.skuid} doesn't match RC entitlements: ${acct.facts.entPortLic.EXT_PRODUCT_ID}. Action: Replaced by RC`
            );
            casePort.skuid = acct.facts.entPortLic.EXT_PRODUCT_ID;
          }
        });
      }
      return true;
    }
  }
}

/////////////
class C2CTextel extends Rule {
  static {
    super.Register("Checks if Textel Overages are missed");
  }
  action(acct) {
    acct.ents.forEach((e) => {
      const ov = Legacy.getTextelPackageOverage(e.EXT_PRODUCT_ID);
      if (ov && !acct.cases.find((c) => c.skuid === ov.SKU)) {
        Rule.AddCase({
          account: acct,
          skuid: ov.SKU,
          sku: ov.NIC_NAME ? ov.NIC_NAME : ov.PRODUCT_NAME,
          qtty: 0,
          price: ov.NIC_PRICE,
        });
        acct.logWarning(
          this.name,
          `Textel Package Overage license was not found. Added ${ov.SKU} from Entitlements`
        );
      }
    });
    return true;
  }
}

/////////////
class RCBadPrice extends Rule {
  static {
    super.Register("Checks if Price minus Discount is not negative");
  }
  action(acct) {
    const withBadPrice = acct.ents.filter(
      (e) =>
        e.PRICE - e.DISCOUNT < 0.0 &&
        acct.logError(
          this.name,
          `Discount (${e.DISCOUNT}) exceeds Price (${e.PRICE}): ${e.EXT_PRODUCT_ID} ${e.ITBS_NAME} (NEEDS ATTENTION)`
        )
    );
    return withBadPrice.length === 0;
  }
}

//////////////////
class AddActiveStorage extends Rule {
  static {
    super.Register("Adds Active Storage to cases");
  }

  action(acct) {
    acct.ents
      .filter(
        (ent) =>
          ent.ProductFamily === RECURRING &&
          Legacy.IsActiveStorage(ent.EXT_PRODUCT_ID) &&
          !acct.cases.find((c) => c.skuid === ent.EXT_PRODUCT_ID)
      )
      .forEach((re) => {
        Rule.AddCase({
          account: acct,
          skuid: re.EXT_PRODUCT_ID,
          qtty: re.QNTY_THRESHOLD,
        });
        acct.logWarning(
          this.name,
          `${re.EXT_PRODUCT_ID} "${re.ITEM_NAME}" was added to case2case to match Entitlements`
        );
      });
    return true;
  }
}

//////////////////
class AddActiveStorageOverage extends Rule {
  static {
    super.Register("Adds Active Storage to cases");
  }

  action(acct) {
    if (
      !acct.nics.find((n) => Legacy.IsActiveStorage(n.SKU)) &&
      !acct.cases.find((c) => Legacy.IsActiveStorage(c.skuid))
    ) {
      const seat = acct.ents.find((ent) => Legacy.IsSeat(ent.EXT_PRODUCT_ID));
      let ASOverageEnt = acct.ents
        .filter(
          (ent) =>
            Legacy.IsActiveStorage(ent.EXT_PRODUCT_ID) &&
            ent.ProductFamily === OVERAGE
        )
        .map((e) => e.EXT_PRODUCT_ID)
        .sort()
        .pop();
      if (!ASOverageEnt) {
        //addentitlement
        ASOverageEnt = Legacy.getActiveStorageSkuID(acct.facts.seat);
        Rule.AddEntitlement({
          acct,
          sku: ASOverageEnt,
          qtty: 1,
          productFamily: OVERAGE,
          correctICB: true,
        });
        acct.logWarning(
          this.name,
          `${ASOverageEnt} - missed act storage entitlement was added`
        );
      }
      Rule.AddCase({
        account: acct,
        skuid: ASOverageEnt,
        qtty: 1,
        addNiC: true,
      });
      acct.logWarning(
        this.name,
        `${ASOverageEnt} - Missed Active Storage was added  to case2case`
      );
    }
    return true;
  }
}

//////////
class RCNoSuchNGBSOverage extends Rule {
  static {
    super.Register("Removes overages not existing in NGBS");
  }
  action(acct) {
    const extra_ovs = acct.ents.filter(
      (row) =>
        !row.Category &&
        !!row.EXT_PRODUCT_ID &&
        row.ProductFamily === OVERAGE &&
        Legacy.SkipOverages(row.EXT_PRODUCT_ID)
    );
    extra_ovs.forEach((ent) => {
      acct.icb_ents = acct.icb_ents.filter(
        (e) =>
          !(e.EXT_PRODUCT_ID === ent.EXT_PRODUCT_ID && e.TYPE_NAME === OVERAGE)
      );
      acct.ents = acct.ents.filter(
        (e) =>
          !(
            e.EXT_PRODUCT_ID === ent.EXT_PRODUCT_ID &&
            e.ProductFamily === OVERAGE
          )
      );
      acct.logInfo(
        this.name,
        `Removed ${ent.EXT_PRODUCT_ID} "${ent.ITBS_NAME}" - No such overage in NGBS catalog`
      );
    });
    return true;
  }
}

/////////////
class RCExtraOverages extends Rule {
  static {
    super.Register("Removes Overage licenses that were not explicitly ordered");
  }
  action(acct) {
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          (e.ProductFamily === OVERAGE &&
            (!acct.facts.entPortLic ||
              e.Category !== acct.facts.entPortLic.Category) &&
            e.Category !== "LASRO" &&
            !Legacy.IsProServOnDemand(e.EXT_PRODUCT_ID) &&
            !acct.cases.find(
              (c) =>
                c.skuid === e.EXT_PRODUCT_ID && (c.qtty > 0 || c.oper === "ADD")
            ) &&
            !acct.nics.find((n) => n.SKU === e.EXT_PRODUCT_ID) &&
            acct.logInfo(
              this.name,
              `Removed ${e.Category ? e.Category : ""}: ${
                e.EXT_PRODUCT_ID ? e.EXT_PRODUCT_ID : ""
              } ${e.ITBS_NAME}`
            )) ||
          (e.ProductFamily === OVERAGE &&
            Legacy.IsTelcoLic(e.EXT_PRODUCT_ID) &&
            acct.logAlarm(
              this.name,
              `Removed: ${e.EXT_PRODUCT_ID} ${e.ITBS_NAME} (NEEDS ATTENTION)`
            ))
        )
    );
    return true;
  }
}

//////////////////
class RCPerBUOverages extends Rule {
  static {
    super.Register(
      "Removes overages  for licenses ordered per BU (as they are meaningless)"
    );
  }

  action(acct) {
    const cond = (ent) =>
      !(
        Legacy.IsPerBULicense(ent.EXT_PRODUCT_ID) &&
        (ent.ProductFamily || ent.TYPE_NAME) === OVERAGE &&
        acct.logWarning(
          this.name,
          `Removed overage of "per BU" license: ${ent.EXT_PRODUCT_ID} ${
            ent.ITEM_NAME || ent.ITBS_NAME
          }`
        )
      );

    acct.ents = acct.ents.filter(cond);
    acct.icb_ents = acct.icb_ents.filter(cond);
    return true;
  }
}

/////////////
class RCFixTextelOvs extends Rule {
  static {
    super.Register("Replace Textel batch Overages");
  }
  action(acct) {
    const textelOverage = acct.ents.find(
      (t) =>
        !t.ITEM_NAME &&
        t.EXT_PRODUCT_ID &&
        t.EXT_PRODUCT_ID.startsWith("3875-12")
    );
    if (textelOverage) {
      textelOverage.ITEM_NAME = "Textel - Overage";
      textelOverage.EXT_PRODUCT_ID = "";
      textelOverage.Category = "LTXTO";
      textelOverage.PRICE = 0.04;
      textelOverage.DISCOUNT = 0.0;
      textelOverage.QNTY_THRESHOLD = 0;
      textelOverage.OldQntyThreshold = 0;
    }
    return true;
  }
}

/////////////
class RCEntCheckDuplicates extends Rule {
  static {
    super.Register(
      "Checks if there are duplicates in result of name-less matching with the catalog"
    );
  }
  action(acct) {
    //4107-645-000:
    if (!!acct.ents.find(({ Category }) => Category === "LAURCRDA")) {
      acct.ents = acct.ents.filter(
        (e) => e.Category !== "LWEMAUREC" && e.Category !== "LWEMAURECO"
      );
    }
    return true;
  }
}

/////////////
class RCEntNaming extends Rule {
  static {
    super.Register(
      "Prints warning if the license name (in the new catalog) and the entitlement name do not match exactly"
    );
  }
  action(acct) {
    acct.ents
      .filter((e) => e.ITEM_NAME && e.ITBS_NAME !== e.ITEM_NAME)
      .forEach((e) => {
        acct.logWarning(
          this.name,
          `Name adjusting: ${e.EXT_PRODUCT_ID} from "${e.ITBS_NAME}" to "${e.ITEM_NAME}"`
        );
      });
    return true;
  }
}

//////////////////
class RCFixPrices2 extends Rule {
  static {
    super.Register("Corrects outdated prices for certain usage licenses");
  }
  action(acct) {
    const targetCats = [
      "LADDASO3O",
      "LAOCRECNUO",
      "LINTADIAPIO",
      "LMLTSRO",
      "LSM1KIABO",
      "LSM2P5KIABO",
      "LSM5KIABO",
      "LSM10KIABO",
      "LSM25KIABO",
      "LSM50KIABO",
      "LSM100KIABO",
      "LWEMDAO",
    ];

    acct.ents
      .filter((e) => targetCats.includes(e.Category))
      .forEach((ent) => {
        if (ent.DISCOUNT < 0) ent.PRICE -= ent.DISCOUNT;
        ent.DISCOUNT = 0.0;
        acct.logWarning(
          this.name,
          `Catalog Price applied: ${ent.Category} (${ent.EXT_PRODUCT_ID}) ${ent.ITEM_NAME}`
        );
      });
    return true;
  }
}

//////////////////
class RCOldTelco extends Rule {
  static {
    super.Register("Deletes old Telecom Licenses");
  }
  action(acct) {
    const toDeleteNames = [
      "International Minutes Overage",
      "IVN Minutes Overage",
      "Domestic Minutes Overage",
    ];
    toDeleteNames.forEach((tdn) => {
      const i = acct.ents.findIndex((e) => e.ITBS_NAME === tdn);
      if (i >= 0) {
        const theIssue = `Removed: ${acct.ents[i].EXT_PRODUCT_ID} ${acct.ents[i].ITBS_NAME}`;
        acct.logInfo(this.name, theIssue);
        acct.ents.splice(i, 1);
      }
    });
    return true;
  }
}

//////////////////
class RCNewTelco extends Rule {
  static {
    super.Register("Adds Free Domestic Telephony Licenses");
  }
  action(acct) {
    Legacy.RCOTelecomLicenses.forEach((tl) => {
      if (acct.ents.find((e) => e.Category === tl.Category) === undefined) {
        acct.ents.push({
          ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
          EXT_PRODUCT_ID: null,
          Category: tl.Category,
          ITEM_NAME: tl.ITEM_NAME,
          QNTY_THRESHOLD: 0,
          PRICE: acct.CURRENCY === "USD" ? tl.USD : tl.CAD,
          DISCOUNT: 0,
          NiCPrice: 0,
          CURRENCY: acct.CURRENCY,
          ProductFamily: OVERAGE,
          batchID: "",
        });
        acct.logInfo(this.name, `Added: ${tl.Category} ${tl.ITEM_NAME}`);
      }
    });
    return true;
  }
}

//////////////////
class RCASROverage extends Rule {
  static {
    super.Register(
      "Adds the ASR Overage License - if it was originally omitted"
    );
  }
  action(acct) {
    if (!acct.ents.find((e) => e.EXT_PRODUCT_ID === Legacy.ASR_SKU)) {
      Rule.AddEntitlement({
        acct,
        sku: Legacy.ASR_SKU,
        qtty: 0,
        productFamily: OVERAGE,
      });
      acct.logInfo(
        this.name,
        `Added: [3615-000-000] Contact Center: Automated Speech Recognition (per minute)`
      );
    }
    return true;
  }
}

//////////////////
class RCFixSocMedia extends Rule {
  static {
    super.Register("Fixes Social Media Overages");
  }
  action(acct) {
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          /^1502-/.test(e.EXT_PRODUCT_ID) &&
          e.ProductFamily === OVERAGE &&
          acct.logInfo(this.name, `Removed: ${e.EXT_PRODUCT_ID} ${e.ITBS_NAME}`)
        )
    );
    return true;
  }
}

//////////////////
class RCFixPrices extends Rule {
  static {
    super.Register("RC: fix Usage Licenses");
  }
  action(acct) {
    const targetSkus = ["4109-673-000", "3399-769-000"];
    acct.ents.forEach((ent) => {
      if (
        targetSkus.find((e) => e === ent.EXT_PRODUCT_ID) &&
        ent.ProductFamily === OVERAGE
      ) {
        ent.DISCOUNT = 0.0;
        const theIssue = `Catalog Price applied: ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`;
        acct.logWarning(this.name, theIssue);
      }
    });
    return true;
  }
}

//////////////////
class RCNiCDirOrdrs extends Rule {
  static {
    super.Register(
      "Checks if there are licenses directly ordered from NiC - and adds them"
    );
  }

  action(acct) {
    acct.nics
      .filter((nic) => Legacy.CanBeOrderedDirectly(nic.SKU))
      .forEach((cbod) => {
        const ent = acct.ents.find(
          (e) => e.EXT_PRODUCT_ID === cbod.SKU && e.ProductFamily === RECURRING
        );
        if (ent) {
          if (ent.QNTY_THRESHOLD < cbod.Quantity) {
            acct.logWarning(
              this.name,
              `${ent.EXT_PRODUCT_ID} amount increased from ${ent.QNTY_THRESHOLD} to ${cbod.Quantity} to match Monthly`
            );
            ent.QNTY_THRESHOLD = cbod.Quantity;
            acct.icb_ents
              .filter((ie) => ie.EXT_PRODUCT_ID === ent.EXT_PRODUCT_ID)
              .forEach((iee) => (iee["QNTY_THRESHOLD"] = cbod.Quantity));
          }
        } else {
          Rule.AddEntitlement({
            acct,
            sku: cbod.SKU,
            qtty: cbod.Quantity,
            correctICB: true,
          });
          acct.logWarning(
            this.name,
            `${cbod.SKU} was added from MRC report as recurring only`
          );
        }
      });
    return true;
  }
}

//////////////////
class NiC_NotFound extends Rule {
  static {
    super.Register("Checks if the account is represented in Monthly");
  }
  action(acct) {
    if (acct.nics.length === 0) {
      acct.logInfo(
        ////To do: Alarm if monthly file with all ents
        this.name,
        `No records were found for the account in the Monthly file`
      );
    }
    return true;
  }
}

//////////////////
class RCNegDiscounts extends Rule {
  static {
    super.Register(
      "Sanity check: Rejects the migration if negative discount was found"
    );
  }
  action(acct) {
    let ok = true;
    const negs = acct.ents.filter((e) => e.DISCOUNT < 0);
    negs.forEach((neg) => {
      if (Legacy.PriceExceptions.includes(neg.EXT_PRODUCT_ID)) {
        acct.logAlarm(
          this.name,
          `Negative discount ${neg.DISCOUNT} for: ${neg.EXT_PRODUCT_ID} ${neg.ITEM_NAME} => Known issue, Replaced by Catalog price`
        );
        Rule.FixPrice(acct, neg);
      } else {
        ok = false;
        acct.logError(
          this.name,
          `Negative discount ${neg.DISCOUNT} for: ${neg.EXT_PRODUCT_ID} ${neg.ITEM_NAME}`
        );
      }
    });

    return ok;
  }
}

//////////////////
class C2CCorr extends Rule {
  static {
    super.Register("RC: Removes corrupted C2C (with empty SKU)");
  }
  action(acct) {
    acct.cases = acct.cases.filter(
      (c2c) =>
        !(
          (!/\d+-\d+-\d+/.test(c2c.skuid) &&
            acct.logWarning(
              this.name,
              `Removed corrupted c2c. skuid: "${c2c.skuid}", sku: "${c2c.sku}"`
            )) ||
          (/610(?!064)\d{3}-.+/.test(c2c.skuid) &&
            acct.logWarning(
              this.name,
              `Removed Prof service lic from c2c. skuid: "${c2c.skuid}", sku: "${c2c.sku}"`
            ))
        )
    );
    return true;
  }
}

//////////////////
class FixActiveStorage extends Rule {
  static {
    super.Register("Fix Active Storage to cases");
  }
  action(acct) {
    const recActiveStorage = acct.ents.find(
      (e) =>
        Legacy.IsActiveStorage(e.EXT_PRODUCT_ID) &&
        e.ProductFamily === RECURRING
    );
    const nicActiveStorage = acct.nics.find((n) =>
      Legacy.IsActiveStorage(n.SKU)
    );
    const c2cActiveStorage = acct.cases.find((c) =>
      Legacy.IsActiveStorage(c.skuid)
    );

    if (
      nicActiveStorage &&
      recActiveStorage &&
      nicActiveStorage.SKU !== recActiveStorage.EXT_PRODUCT_ID
    ) {
      //replace ents & cases
      acct.ents = acct.ents.filter(
        (e) => !Legacy.IsActiveStorage(e.EXT_PRODUCT_ID)
      );
      acct.icb_ents = acct.icb_ents.filter(
        (e) => !Legacy.IsActiveStorage(e.EXT_PRODUCT_ID)
      );

      Rule.AddEntitlement({
        acct,
        sku: nicActiveStorage.SKU,
        qtty: recActiveStorage.QNTY_THRESHOLD,
        productFamily: RECURRING,
        correctICB: true,
      });

      acct.cases = acct.cases.filter(
        (c2c) => !Legacy.IsActiveStorage(c2c.skuid)
      );
      Rule.AddCase({
        account: acct,
        skuid: nicActiveStorage.SKU,
        qtty: recActiveStorage.QNTY_THRESHOLD,
      });
      acct.logWarning(
        this.name,
        `${nicActiveStorage.SKU} was added to ents and case2case to match RCMRC`
      );
    } else if (
      nicActiveStorage &&
      (!c2cActiveStorage || nicActiveStorage.SKU !== c2cActiveStorage.skuid)
    ) {
      acct.cases = acct.cases.filter(
        (c2c) => !Legacy.IsActiveStorage(c2c.skuid)
      );
      Rule.AddCase({
        account: acct,
        skuid: nicActiveStorage.SKU,
        qtty: recActiveStorage ? recActiveStorage.QNTY_THRESHOLD : 0,
      });

      acct.logWarning(
        this.name,
        `${nicActiveStorage.SKU} was added to case2case to match RCMRC`
      );
    } else if (
      recActiveStorage &&
      (!c2cActiveStorage ||
        c2cActiveStorage.skuid !== recActiveStorage.EXT_PRODUCT_ID)
    ) {
      acct.cases = acct.cases.filter(
        (c2c) => !Legacy.IsActiveStorage(c2c.skuid)
      );
      Rule.AddCase({
        account: acct,
        skuid: recActiveStorage.EXT_PRODUCT_ID,
        qtty: recActiveStorage.QNTY_THRESHOLD,
      });
      acct.logWarning(
        this.name,
        `${recActiveStorage.EXT_PRODUCT_ID} "${recActiveStorage.ITEM_NAME}" was added to case2case to match Entitlements`
      );
    }
    return true;
  }
}

//////////////////
class C2CvsMRC extends Rule {
  static {
    super.Register(
      "(1) Checks if there are licenses in Cases which are absent in Monthly, (2) Checks if their prices are the same"
    );
  }
  action(acct) {
    let rule_res = true;
    acct.cases.forEach((c2c) => {
      const nicLic = acct.nics.find((nl) => nl.SKU === c2c.skuid);
      const entLic = acct.ents.find((ent) => ent.EXT_PRODUCT_ID === c2c.skuid);
      if (nicLic === undefined) {
        acct.logInfo(
          this.name,
          `${c2c.skuid} was not found in Monthly file but is presented in case2case`
        );
        if (entLic) {
          Rule.AddNiC({
            account: acct,
            skuid: c2c.skuid,
            sku: c2c.sku,
          });
          acct.logWarning(
            this.name,
            `${c2c.skuid} was not found in Monthly file but is presented in case2case. Added to Monthly.`
          );
        }
      } else if (nicLic.Quantity > 0) {
        const p = Math.round((nicLic.Amount / nicLic.Quantity) * 100) / 100;
        if (c2c.price != p) {
          acct.logWarning(
            this.name,
            `Different prices ${c2c.skuid}: $${c2c.price} in cases vs $${p} in Monthly`
          );
          c2c.price = p;
        }
      }
    });
    return rule_res;
  }
}
//////////////////
class NiC_MRCvsDWH extends Rule {
  static {
    super.Register(
      "Checks if there are licenses in Monthly which are absent in RC entitlements"
    );
  }
  action(acct) {
    let rule_res = true;
    acct.nics.forEach((nl) => {
      const entLic = acct.ents.find((el) => nl.SKU === el.EXT_PRODUCT_ID);
      if (entLic === undefined) {
        if (Legacy.IsException(nl)) {
          acct.logAlarm(
            this.name,
            `${nl.SKU} ($${
              nl.Amount
            }) was found in NiC MRC file but not in RC entitlements (Known exception). ${
              nl.Amount > 0.0 ? "NEEDS ATTENTION!" : ""
            }`
          );
        } else if (nl.Amount <= 0.0) {
          acct.logAlarm(
            this.name,
            `${nl.SKU} ($${nl.Amount}) was found in NiC MRC file but not in RC entitlements. NEEDS ATTENTION!`
          );
        }
      }
    });
    return rule_res;
  }
}

//////////////////
class MRCvsC2C extends Rule {
  static {
    super.Register(
      "Checks if there are licenses in Monthly which are absent in cases - and adds them"
    );
  }
  action(acct) {
    let rule_res = true;
    acct.nics.forEach((nl) => {
      const caseLic = acct.cases.find((cl) => nl.SKU === cl.skuid);
      if (caseLic === undefined && Legacy.IsException(nl)) {
        const entLic = acct.ents.find((el) => nl.SKU === el.EXT_PRODUCT_ID);
        if (entLic === undefined) {
          acct.logAlarm(
            this.name,
            `${nl.SKU} was not found in case2case and entitlements but is presented in Monthly file. NEEDS ATTENTION!`
          );
          return;
        }
        if (nl.Quantity > 0) {
          Rule.AddCase({
            account: acct,
            skuid: nl.SKU,
            sku: nl.Product,
            qtty: entLic.OldQntyThreshold,
            price: nl.Amount / nl.Quantity,
          });
          const theIssue = `${nl.SKU} was not found in case2case but is presented in Monthly file`;
          acct.logWarning(this.name, theIssue);
        } else {
          Rule.AddCase({
            account: acct,
            skuid: nl.SKU,
            sku: nl.Product,
            qtty: entLic.OldQntyThreshold,
            price: entLic.NiCPrice,
          });
          const theIssue = `${nl.SKU} was not found in case2case but is presented in MRC. Price was added from the entitlement`;
          acct.logWarning(this.name, theIssue);
        }
      }
    });
    return rule_res;
  }
}

//////////////////
class RCCMapping extends Rule {
  static {
    super.Register(
      "Checks if there are no acct.problems with mapping ITBS licenses to NGBS catalog"
    );
  }
  action(acct) {
    const bad = acct.ents.filter((row) => !row.Category);
    bad.forEach((ent) => {
      acct.logError(
        this.name,
        `INTERNAL ERROR: ${
          ent.EXT_PRODUCT_ID !== null ? ent.EXT_PRODUCT_ID : ""
        } "${ent.ITBS_NAME}" - is not mapped to NGBS catalog`
      );
    });
    return !bad.length;
  }
}

//////////////////
class QntyVsThrsh extends Rule {
  static {
    super.Register("Checks recurring QNTYs vs overages thresholds");
  }
  action(acct) {
    let isOK = true;

    acct.ents
      .filter(
        (row) =>
          row.ProductFamily === RECURRING &&
          row.EXT_PRODUCT_ID !== null &&
          !Legacy.CanBeOrderedDirectly(row.EXT_PRODUCT_ID)
      )
      .forEach((r) => {
        const overage = acct.ents.find(
          (o) =>
            o.ProductFamily === OVERAGE &&
            o.EXT_PRODUCT_ID === r.EXT_PRODUCT_ID &&
            o.OldQntyThreshold !== r.OldQntyThreshold
        );
        if (overage) {
          const msg = `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - Recurring qnty (${r.OldQntyThreshold}) is not equal to overage (${overage.OldQntyThreshold}) - NEEDS ATTENTION!`;
          if (
            Legacy.IsByBusinessUnit(r.EXT_PRODUCT_ID) ||
            Legacy.CanBeOrderedDirectly(r.EXT_PRODUCT_ID)
          ) {
            acct.logWarning(this.name, msg);
          } else {
            acct.logAlarm(this.name, msg);
          }
        }
      });
    return isOK;
  }
}

//////////////////
class EntsVsCases extends Rule {
  static {
    super.Register("Checks if all recurring entitlements are known to NiC");
  }
  static RecPortExclusions = ["308-8-167"];

  action(acct) {
    let isOK = true;
    acct.ents
      .filter(
        (ent) =>
          !!ent.EXT_PRODUCT_ID &&
          ent.ProductFamily === RECURRING &&
          !acct.cases.find((c) => c.skuid === ent.EXT_PRODUCT_ID)
      )
      .forEach((re) => {
        if (!Legacy.CanBeOrderedDirectly(re.EXT_PRODUCT_ID)) {
          acct.logAlarm(
            this.name,
            EntsVsCases.RecPortExclusions.includes(re.EXT_PRODUCT_ID)
              ? `${re.EXT_PRODUCT_ID} ${re.ITBS_NAME} - Recurring port entitlement was not found in NiC. Added!`
              : acct.facts.NBU
              ? `${re.EXT_PRODUCT_ID} ${re.ITBS_NAME} - Recurring entitlement is not found in NiC while NBU was found. Added!`
              : `${re.EXT_PRODUCT_ID} ${re.ITBS_NAME} - Recurring entitlement is not found in NiC. No NBU case found. Added!`
          );
        }
        Rule.AddCase({
          account: acct,
          skuid: re.EXT_PRODUCT_ID,
          qtty: re.QNTY_THRESHOLD,
          addNiC: true,
        });
      });
    return isOK;
  }
}

//////////////////
class QntyVsCases extends Rule {
  static {
    super.Register("Checks recurring QNTYs vs NiCs");
  }
  action(acct) {
    const ACTIVE_STORAGE_SKU = "309-11-171";

    let isOK = true;
    acct.ents
      .filter((ent) => ent.ProductFamily === RECURRING && !!ent.EXT_PRODUCT_ID)
      .forEach((r) => {
        const c2c = acct.cases.find(
          (c) =>
            c.skuid === r.EXT_PRODUCT_ID &&
            c.qtty !== r.OldQntyThreshold &&
            r.EXT_PRODUCT_ID != acct.facts.entPortLic.EXT_PRODUCT_ID
        );
        if (c2c) {
          if (r.EXT_PRODUCT_ID === ACTIVE_STORAGE_SKU) {
            acct.logWarning(
              this.name,
              `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - Recurring qnty (${r.OldQntyThreshold}) is not equal to NiC (${c2c.qtty})`
            );
          } else if (
            acct.facts.NBU &&
            !Legacy.CanBeOrderedDirectly(r.EXT_PRODUCT_ID)
          ) {
            acct.logError(
              this.name,
              `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - Recurring qnty (${r.OldQntyThreshold}) is not equal to NiC (${c2c.qtty}) while NBU was found`
            );
            //            isOK = true;
            isOK = false;
          } else {
            acct.logWarning(
              this.name,
              `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - NiC case qnty (${c2c.qtty}) is corrected to Recurring qnty (${r.OldQntyThreshold})`
            );
            c2c.qtty = r.OldQntyThreshold;
          }
        }
      });
    return isOK;
  }
}

//////////////////
class C2CtoVendCat extends Rule {
  static {
    super.Register(
      "Removing of deleted licenses, comparing with new Engagements"
    );
  }
  action(acct) {
    acct.cases = acct.cases.filter(
      (c2c) =>
        !(
          !acct.ents.find((r) => c2c.skuid === r.EXT_PRODUCT_ID) &&
          ((acct.facts.NBU &&
            c2c.qtty === 0 &&
            acct.logInfo(
              this.name,
              `${c2c.skuid} was removed from Vendor Order as obsolete`
            )) ||
            acct.logWarning(
              this.name,
              `${c2c.skuid} was removed from Vendor Order: Qnty: ${c2c.qtty}`
            ))
        )
    );

    return true;
  }
}

//////////////////////////////////
export class RuleEngine {
  run(acct) {
    let skipRules = false;
    Rule.Registered.forEach((rule) => {
      if (!skipRules) {
        const res = rule.Action.action(acct);
        if (!res) {
          skipRules = true;
        }
      }
    });
    return !skipRules;
  }
}
