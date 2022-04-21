const OVERAGE = "Overage";

class Rule {
  static portMap = {
    LRCCCU2SEATO: ["LAPRTUESO", "LAPRTUPESO"],
    LRCCCA2SEATO: ["LAPRTAAE2O", "LAPRTAAPEO"],
    LRCCCUCSEATO: ["LAPRTUPESO", "LAPRTAUECO"],
    LRCCCACSEATO: ["LAPRTAAECO"],
    LRCCCBASEATO: ["LAPRTBESWAO"],
    LRCCCUPSEATO: ["LAPRTUPESO"],
    LRCCCAPSEATO: ["LAPRTAAPEO"],
    LRCCCUSEATO: ["LAPRTAUEO"],
    LRCCCA1SEATO: ["LAPRTBESO"],
  };

  static RCOTelecomLicenses = [
    {
      Category: "LICIBL",
      ITEM_NAME: "Inbound Local, per 10 min",
      USD: 0.0,
      CAD: 0,
    },
    {
      Category: "LICIBTF",
      ITEM_NAME: "Inbound Toll Free, per 10 min",
      USD: 0.14,
      CAD: 0.14,
    },
    {
      Category: "LICIBINT",
      ITEM_NAME: "Inbound International",
      USD: 0.01,
      CAD: 0.01,
    },
    {
      Category: "LICOBLC",
      ITEM_NAME: "Outbound Local Conversational, per 10 min",
      USD: 0.0,
      CAD: 0.0,
    },
    {
      Category: "LICOBIC",
      ITEM_NAME: "Outbound International Conversational",
      USD: 0.01,
      CAD: 0.01,
    },
    {
      Category: "LICOBDL",
      ITEM_NAME: "Outbound Dialer Local, per 10 min",
      USD: 0.16,
      CAD: 0.16,
    },
    {
      Category: "LICOBDINT",
      ITEM_NAME: "Outbound Dialer International",
      USD: 0.01,
      CAD: 0.01,
    },
    {
      Category: "LICOBLTF",
      ITEM_NAME: "Outbound local Toll Free",
      USD: 0.0,
      CAD: 0.0,
    },
  ];
  static ASR_OVERAGE = {
    Category: "LASRO",
    ITEM_NAME: "Contact Center: Automated Speech Recognition (per minute)",
    USD: 0.06,
    CAD: 0.08,
    NiCPrice: 0.05,
  };

  static BUNDLE25K = {
    Category: "LICIBTF25KB",
    ITEM_NAME: "Inbound Toll Free 25K Bundle",
    USD: 350.0,
    CAD: 450.0,
  };

  static Exceptions = [
    "1561-49-000", // Service Package - CXsuccess Care Package
    "3157-18-204", // Chat  and Email Channel - CXone Chat & Email (per Configured User)
    "1028-171-000", // SIP Trunking Service - CXone SIP Connectivity over Internet
  ];

  constructor({ description = "" } = {}) {
    this.description = description;
  }
  get name() {
    return this.constructor.name;
  }
}

/////////////
class RCCheckSeats extends Rule {
  constructor() {
    super({
      description: "Checks seats",
    });
  }
  action(acct) {
    const seats = acct.ents.filter(
      (row) =>
        /^307-/.test(row.EXT_PRODUCT_ID) && row.ITEM_NAME !== "Seat Overage"
    );
    if (seats.length !== 1) {
      acct.logError(
        this.name,
        "Incorrect number of Seat licenses (was not found or more than one)"
      );
      return false;
    }

    let strippedName = seats[0].ITEM_NAME;
    const x = seats[0].ITEM_NAME.match(/ \d+ \- \d+/);
    if (x) strippedName = strippedName.replace(x[0], "");

    acct.facts.seat = acct.ents.find(
      (row) =>
        row.EXT_PRODUCT_ID === seats[0].EXT_PRODUCT_ID &&
        row.ITEM_NAME === "Seat Overage" &&
        row.PARENT === strippedName
    );
    if (acct.facts.seat === undefined) {
      acct.logError(
        this.name,
        "Seat overage license was not found or doesn't match the seat license"
      );
      return false;
    }

    // Cleanup of extra seat overages if any
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          /^307-/.test(e.EXT_PRODUCT_ID) &&
          e.Category !== seats[0].Category &&
          e.Category !== acct.facts.seat.Category &&
          acct.logInfo(this.name, `Removed: ${e.EXT_PRODUCT_ID} ${e.ITEM_NAME}`)
        )
    );
    return true;
  }
}

class RCPorts4Seats extends Rule {
  constructor() {
    super({
      description: "Checks if ports match seats",
    });
  }
  action(acct) {
    if (!Rule.portMap.hasOwnProperty(acct.facts.seat.Category)) {
      const theIssue = `Unknown port2seat mapping: ${acct.facts.seat.Category}`;
      acct.logError(this.name, theIssue);
      return false;
    }
    return true;
  }
}

/////////////
class RCFixPorts extends Rule {
  constructor() {
    super({
      description: "Check/Fix Ports",
    });
  }
  action(acct) {
    const entPorts = acct.ents.filter(
      (row) =>
        /^308-/.test(row.EXT_PRODUCT_ID) && row.ProductFamily === "Overage"
    );

    if (entPorts.length === 0) {
      acct.logError(this.name, "RC Port Overage license was not found");
      return false;
    }
    const nicPort = acct.nics.find((nic) => /^308-/.test(nic.SKU));
    if (nicPort === undefined) {
      acct.logWarning(this.name, "NiC Port Overage license was not found");
    } else if (nicPort.SKU !== entPorts[0].EXT_PRODUCT_ID) {
      acct.logWarning(
        this.name,
        `NiC Port license ${nicPort.SKU} doesn't match RC entitlements: ${entPorts[0].EXT_PRODUCT_ID}. Action: Replaced by RC`
      );
      nicPort.SKU = entPorts[0].EXT_PRODUCT_ID;
    }

    acct.facts.entPortLic = entPorts[0];
    if (entPorts.length > 1) {
      const p = entPorts.find(
        (e) =>
          -1 <
          Rule.portMap[acct.facts.seat.Category].findIndex(
            (p) => p === e.Category
          )
      ); // Expected port by seat type
      if (p !== undefined) acct.facts.entPortLic = p;
    }

    // Cleanup of extra overage ports
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          /^308-/.test(e.EXT_PRODUCT_ID) &&
          e.ProductFamily === OVERAGE &&
          e.Category !== acct.facts.entPortLic.Category
        )
    );
    return true;
  }
}

/////////////
class RCExtraOverages extends Rule {
  constructor() {
    super({
      description: "Remove overage licenses without direct order",
    });
  }
  action(acct) {
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          e.ProductFamily === OVERAGE &&
          e.Category !== "LASRO" &&
          acct.cases.findIndex((c) => c.skuid === e.EXT_PRODUCT_ID) === -1 &&
          acct.nics.findIndex((n) => n.SKU === e.EXT_PRODUCT_ID) === -1 &&
          acct.logInfo(this.name, `Removed: ${e.EXT_PRODUCT_ID} ${e.ITBS_NAME}`)
        )
    );
    return true;
  }
}

/////////////
class RCEntNaming extends Rule {
  constructor() {
    super({
      description:
        "Prints warning if the license name (in the new catalog) and the entitlement name do not match exactly",
    });
  }
  action(acct) {
    acct.ents
      .filter((e) => e.ITBS_NAME !== e.ITEM_NAME)
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
class RCNegDiscounts extends Rule {
  constructor() {
    super({
      description:
        "Sanity check: Reject the migration if negative discount was found",
    });
  }
  action(acct) {
    const neg = acct.ents.find((e) => e.DISCOUNT < 0);
    if (neg === undefined) {
      return true;
    }
    const theIssue = `Negative discount ${neg.DISCOUNT} for: ${neg.EXT_PRODUCT_ID} ${neg.ITEM_NAME}`;
    acct.logError(this.name, theIssue);
    return false;
  }
}

//////////////////
class RCFixPrices2 extends Rule {
  constructor() {
    super({
      description: "RC: fix Usage Licenses",
    });
  }
  action(acct) {
    // const targetCats = [
    //   "CCL_LAOCRECNUO_436",
    //   "CCL_LSM1KIABO_470",
    //   "CCL_LSM2P5KIABO_471",
    //   "CCL_LSM5KIABO_472",
    //   "CCL_LSM10KIABO_473",
    //   "CCL_LSM25KIABO_474",
    //   "CCL_LSM50KIABO_475",
    //   "CCL_LSM100KIABO_476",
    //   "CCL_LWEMDAO_628",
    //   "CCL_LINTADIAPIO_658",
    // ];
    const targetCats = [
      "LAOCRECNUO",
      "LSM1KIABO",
      "LSM2P5KIABO",
      "LSM5KIABO",
      "LSM10KIABO",
      "LSM25KIABO",
      "LSM50KIABO",
      "LSM100KIABO",
      "LWEMDAO",
      "LINTADIAPIO",
    ];

    targetCats.forEach((e) => {
      const i = acct.ents.findIndex((ent) => e === ent.Category);
      if (i >= 0) {
        acct.ents[i].DISCOUNT = 0.0;
        const theIssue = `Catalog Price applied: ${acct.ents[i].Category} (${acct.ents[i].EXT_PRODUCT_ID}) ${acct.ents[i].ITEM_NAME}`;
        acct.logWarning(this.name, theIssue);
      }
    });
    return true;
  }
}

//////////////////
class RCProfServOnDemand extends Rule {
  constructor() {
    super({
      description: "Delete Professional Service Licenses",
    });
  }
  action(acct) {
    const toDeleteNames = ["610064-000-000", "610064-302-000"];
    toDeleteNames.forEach((tdn) => {
      const i = acct.ents.findIndex((e) => e.EXT_PRODUCT_ID === tdn);
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
class RCOldTelco extends Rule {
  constructor() {
    super({
      description: "Delete old Telecom Licenses",
    });
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
  constructor() {
    super({
      description: "Add Free Domestic Telephony Licenses",
    });
  }
  action(acct) {
    Rule.RCOTelecomLicenses.forEach((tl) => {
      if (acct.ents.find((e) => e.Category === tl.Category) === undefined) {
        acct.ents.push({
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
        const theIssue = `Added: ${tl.Category} ${tl.ITEM_NAME}`;
        acct.logInfo(this.name, theIssue);
      }
    });
    return true;
  }
}

//////////////////
class RCASROverage extends Rule {
  constructor() {
    super({
      description: "Add ASR Overage License - if it was originally omitted",
    });
  }
  action(acct) {
    if (
      acct.ents.find((e) => e.Category === Rule.ASR_OVERAGE.Category) ===
      undefined
    ) {
      acct.ents.push({
        EXT_PRODUCT_ID: null,
        Category: Rule.ASR_OVERAGE.Category,
        ITEM_NAME: Rule.ASR_OVERAGE.ITEM_NAME,
        QNTY_THRESHOLD: 0,
        PRICE:
          acct.CURRENCY === "USD" ? Rule.ASR_OVERAGE.USD : Rule.ASR_OVERAGE.CAD,
        DISCOUNT: 0,
        NiCPrice: Rule.ASR_OVERAGE.NiCPrice,
        CURRENCY: acct.CURRENCY,
        ProductFamily: OVERAGE,
        batchID: "",
      });
      const theIssue = `Added: ${Rule.ASR_OVERAGE.Category} ${Rule.ASR_OVERAGE.ITEM_NAME}`;
      acct.logInfo(this.name, theIssue);
    }
    return true;
  }
}

//////////////////
class RC25kBundles extends Rule {
  constructor() {
    super({
      description: "Convert different-size toll-free bundles to 25K",
    });
  }
  action(acct) {
    const batchPattern =
      /Contact Center: (?<Mega>\d+M )?(?<Kilo>\d+K )?Domestic Minutes Bundle/;
    acct.ents
      .filter((e) => "ITBS_NAME" in e && e.ITBS_NAME.match(batchPattern))
      .forEach((bundle) => {
        acct.logInfo(
          this.name,
          `Replaced: "${bundle.ITBS_NAME}" with 25K bundles`
        );

        const { Mega, Kilo } = bundle.ITBS_NAME.match(batchPattern).groups;
        const qtty =
          ((Mega ? 40 * Mega.slice(0, -2) : 0) +
            (Kilo ? 0.04 * Kilo.slice(0, -2) : 0)) *
          bundle.QNTY_THRESHOLD;

        bundle.Category = Rule.BUNDLE25K.Category;
        bundle.ITEM_NAME = Rule.BUNDLE25K.ITEM_NAME;
        bundle.QNTY_THRESHOLD = qtty;
        bundle.PRICE =
          bundle.CURRENCY === "USD" ? Rule.BUNDLE25K.USD : Rule.BUNDLE25K.CAD;
        bundle.DISCOUNT = bundle.PRICE - bundle.OldPrice / qtty;
        bundle.ProductFamily = OVERAGE;
      });
    return true;
  }
}

//////////////////
class RCFixSocMedia extends Rule {
  constructor() {
    super({
      description: "Fix Social Media Overages",
    });
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
  constructor() {
    super({
      description: "RC: fix Usage Licenses",
    });
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
class NiC_StripXX extends Rule {
  constructor() {
    super({
      description:
        "RC: Removing the _XX suffix in C2C (to enable further matching)",
    });
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

//////////////////
class NiC_MRCvsDWH extends Rule {
  constructor() {
    super({
      description:
        "Check if there are licenses in Monthly which are absent in RC entitlements.",
    });
  }
  action(acct) {
    let rule_res = true;
    acct.nics.forEach((nl) => {
      const entLic = acct.ents.find((el) => nl.SKU === el.EXT_PRODUCT_ID);
      if (entLic === undefined) {
        if (
          nl.Amount == 0.0 &&
          Rule.Exceptions.find((ex) => nl.SKU === ex) !== undefined
        ) {
          const theIssue = `${nl.SKU}  was found in NiC MRS file but not in RC entitlements. Ignored as a known exception`;
          acct.logWarning(this.name, theIssue);
        } else {
          acct.logError(
            this.name,
            `${nl.SKU} ($${nl.Amount}) was found in NiC MRS file but not in RC entitlements`
          );
          rule_res = false;
        }
      }
    });
    return rule_res;
  }
}

//////////////////
class NiC_NotFound extends Rule {
  constructor() {
    super({
      description: "Check if the account is represented in Monthly",
    });
  }
  action(acct) {
    if (acct.nics.length === 0) {
      acct.logError(
        this.name,
        `No records were found for the account in the Monthly file`
      );
      return false;
    }
    return true;
  }
}

//////////////////
class NiC_C2CvsMRC extends Rule {
  constructor() {
    super({
      description:
        "(1) Checks if there are licenses in Cases which are absent in Monthly, (2) Checks if their prices are the same",
    });
  }
  action(acct) {
    let rule_res = true;
    acct.cases.forEach((c2c) => {
      const nicLic = acct.nics.find((nl) => nl.SKU === c2c.skuid);
      if (nicLic === undefined) {
        acct.logWarning(
          this.name,
          `${c2c.skuid} was not found in Monthly file but is presented in case2case`
        );
      } else if (nicLic.Quantity > 0) {
        const p = Math.round((nicLic.Amount / nicLic.Quantity) * 100) / 100;
        if (c2c.price != p) {
          acct.logWarning(
            this.name,
            `Different prices ${c2c.skuid}: $${c2c.price} in cases vs $${p} in Monthly`
          );
        }
      }
    });
    return rule_res;
  }
}

//////////////////
class NiC_MRCvsC2C extends Rule {
  constructor() {
    super({
      description:
        "Check if there are licenses in Monthly which are absent in cases - and add them",
    });
  }
  action(acct) {
    let rule_res = true;
    acct.nics.forEach((nl) => {
      const caseLic = acct.cases.find((cl) => nl.SKU === cl.skuid);
      if (
        caseLic === undefined &&
        Rule.Exceptions.find((ex) => nl.SKU === ex) === undefined
      ) {
        const entLic = acct.ents.find((el) => nl.SKU === el.EXT_PRODUCT_ID);
        if (entLic === undefined) {
          acct.logError(
            this.name,
            `${nl.SKU} was not found in case2case but is presented in Monthly file. CANNOT BE RESTORED!`
          );
          rule_res = false;
          return;
        }
        if (nl.Quantity > 0) {
          acct.cases.push({
            skuid: nl.SKU,
            sku: nl.Product,
            qtty: entLic.QNTY_THRESHOLD,
            price: nl.Amount / nl.Quantity,
          });
          const theIssue = `${nl.SKU} was not found in case2case but is presented in Monthly file`;
          acct.logWarning(this.name, theIssue);
        } else {
          acct.cases.push({
            skuid: nl.SKU,
            sku: nl.Product,
            qtty: entLic.QNTY_THRESHOLD,
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
  constructor() {
    super({
      description:
        "Checks if there are no acct.problems with mapping ITBS licenses to NGBS catalog",
    });
  }
  action(acct) {
    const bad = acct.ents.filter((row) => row.Category === null);
    bad.forEach((ent) => {
      acct.logError(
        this.name,
        `${ent.EXT_PRODUCT_ID !== null ? ent.EXT_PRODUCT_ID : ""} "${
          ent.ITBS_NAME
        }" - is not mapped to NGBS catalog`
      );
    });
    return !bad.length;
  }
}

//////////////////
class NiCPorts extends Rule {
  constructor() {
    super({
      description: "Check/Fix NiC pors",
    });
  }
  action(acct) {
    const casePortLic = acct.cases.find((c) => /^308-/.test(c.skuid));
    if (casePortLic === undefined) {
      acct.logError(this.name, "NiC PortOverage license was not found");
      return false;
    }
    if (casePortLic.skuid !== acct.facts.entPortLic.EXT_PRODUCT_ID) {
      const theIssue = `inContact port ${casePortLic.skuid} replaced by ${acct.facts.entPortLic.EXT_PRODUCT_ID} to match Entitlements`;
      acct.logWarning(this.name, theIssue);
      casePortLic.skuid = acct.facts.entPortLic.EXT_PRODUCT_ID;
    }
    return true;
  }
}

//////////////////////////////////
export class RuleEngine {
  constructor() {
    this.rules = [
      new RCCheckSeats(),
      new RCPorts4Seats(),
      new RCFixPorts(),
      new RCExtraOverages(),
      new RCEntNaming(),
      new RCNegDiscounts(),
      new RCFixPrices2(),
      new RCProfServOnDemand(),
      new RCOldTelco(),
      new RCNewTelco(),
      new RCASROverage(),
      new RC25kBundles(),
      new RCFixSocMedia(),
      new RCFixPrices(),
      new NiC_NotFound(),
      new NiC_StripXX(),
      new NiC_C2CvsMRC(),
      new NiC_MRCvsDWH(),
      new NiC_MRCvsC2C(),
      new RCCMapping(),
      new NiCPorts(),
    ];
  }
  run(acct) {
    acct.facts = {};
    let skipRules = false;
    this.rules.forEach((rule) => {
      if (!skipRules) {
        console.log(rule.description);
        const res = rule.action(acct);
        if (!res) {
          skipRules = true;
        }
      }
    });
    return !skipRules;
  }
}
