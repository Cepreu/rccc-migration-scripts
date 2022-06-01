const OVERAGE = "Overage";

class Rule {
  static seatOverageMap = [
    [
      "LRCCCA1SEATO",
      "Contact Center: Advanced Edition Seat",
      139.99,
      179.99,
      "307-6-216",
    ],
    [
      "LRCCCA2SEATO",
      "Contact Center: Advanced Edition Seat (2 ports)",
      179.99,
      229.99,
      "307-6-291",
    ],
    [
      "LRCCCACSEATO",
      "Contact Center: Advanced Edition Concurrent Seat",
      259.99,
      334.99,
      "307-6-289",
    ],
    [
      "LRCCCAPSEATO",
      "Contact Center: Advanced-Plus Edition Seat",
      169.99,
      209.99,
      "307-6-270",
    ],
    [
      "LRCCCBASEATO",
      "Contact Center: Basic Edition Seat with Advanced IVR (2 ports)",
      179.99,
      231.19,
      "307-6-287",
    ],
    [
      "LRCCCBCSEATO",
      "Contact Center: Basic Edition Concurrent Seat",
      214.99,
      274.99,
      "307-6-284",
    ],
    [
      "LRCCCBCWASEATO",
      "Contact Center: Basic Edition Concurrent Seat with Advanced IVR",
      259.99,
      336.78,
      "307-6-288",
    ],
    [
      "LRCCCBSEATO",
      "Contact Center: Basic Edition Seat",
      149.99,
      169.99,
      "307-6-216",
    ],
    [
      "LRCCCPCINUSEATO",
      "Contact Center: PCI Level 1 Edition Seat (per Named-User)",
      187,
      250,
      "307-6-218",
    ],
    [
      "LRCCCPCISEATO",
      "Contact Center: PCI Level 1 Edition Seat (per Configured Station)",
      230,
      300,
      "307-4-220",
    ],
    [
      "LRCCCSSEATO",
      "Contact Center: Configured Station License",
      195,
      254,
      "307-4-178",
    ],
    [
      "LRCCCU2SEATO",
      "Contact Center: Ultimate Edition Seat (2.5 ports)",
      219.99,
      279.99,
      "307-6-292",
    ],
    [
      "LRCCCUCSEATO",
      "Contact Center: Ultimate Edition Concurrent Seat",
      319.99,
      409.99,
      "307-6-290",
    ],
    [
      "LRCCCUPSEATO",
      "Contact Center: Ultimate-Plus Edition Seat",
      199.99,
      259.99,
      "307-6-271",
    ],
    [
      "LRCCCUSEATO",
      "Contact Center: Ultimate Edition Seat",
      199.99,
      259.99,
      "307-6-217",
    ],
    [
      "LRCCSEATUESO",
      "Contact Center: Ultimate Edition Seat (3 ports)",
      190,
      235,
      "12658-1727-001",
    ],
  ];

  ////////////
  static portMap = {
    LRCCCA1SEATO: ["LAPRTBESO"],
    LRCCCA2SEATO: ["LAPRTAAE2O", "LAPRTAAPEO"],
    LRCCCACSEATO: ["LAPRTAAECO"],
    LRCCCAPSEATO: ["LAPRTAAPEO"],
    LRCCCBASEATO: ["LAPRTBESWAO"],
    LRCCCBSEATO: ["LAPRTBESO"],
    LRCCCU2SEATO: ["LAPRTUESO", "LAPRTUPESO"],
    LRCCCUCSEATO: ["LAPRTUPESO", "LAPRTAUECO"],
    LRCCCUPSEATO: ["LAPRTUPESO"],
    LRCCCUSEATO: ["LAPRTAUEO"],
    LRCCCBCSEATO: ["LAPRTABECO"],
    LRCCSEATUESO: ["APRTO"],
    RCCCUCC3PSEATO: ["APRTO"],
    RCCCE3PSEATO: ["APRTO"],
    RCCCP3PSEATO: ["APRTO"],
    RCCCS3PSEATO: ["APRTO"],
    RCCCSC3PSEATO: ["APRTO"],
    RCCCU3PSEATO: ["APRTO"],
    RCCCEC3PSEATO: ["APRTO"],
    RCCCPC3PSEATO: ["APRTO"],
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
    "610148-597-000", // NICE Training - IEX WFM Integrated Training
    "610060-296-000", // "Contact Center: Instructor-Led Interactive Training (At Customer Facility; min 2"
    "154-487-000", // SMS/MMS Setup
    "154-493-000", // SMS/MMS Setup
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
      description: "Checks for the existence and uniqueness of a Seat license",
    });
  }
  action(acct) {
    const seatPattern = /^307-(?!6-603).*$|^1265.-.*$/; // 307-6-603 is exclusion: the digital add-on; 1265* - new gen seats
    const seats = acct.ents.filter(
      (row) =>
        seatPattern.test(row.EXT_PRODUCT_ID) &&
        row.ITEM_NAME !== "Seat Overage" &&
        row.QNTY_THRESHOLD > 0
    );
    if (seats.length !== 1) {
      acct.logError(
        this.name,
        seats.length === 0
          ? "Seat licenses not found"
          : `More than one seat licenses were found (${seats.length})`
      );
      return false;
    }
    acct.facts.seat = seats[0];
    return true;
  }
}

/////////////
class RCCSeatOverage extends Rule {
  constructor() {
    super({
      description: "Checks/Fixes Seat Overage license",
    });
  }
  action(acct) {
    let strippedSeatName = acct.facts.seat.ITEM_NAME;
    const x = strippedSeatName.match(/ \d+ \- \d+/);
    if (x) strippedSeatName = strippedSeatName.replace(x[0], "");

    acct.facts.seatOverage = acct.ents.find(
      (row) =>
        row.EXT_PRODUCT_ID === acct.facts.seat.EXT_PRODUCT_ID &&
        row.ITEM_NAME === "Seat Overage" &&
        row.QNTY_THRESHOLD > 0 &&
        row.PARENT === strippedSeatName
    );
    if (acct.facts.seatOverage === undefined) {
      const SOLic = Rule.seatOverageMap.find((l) => l[1] === strippedSeatName);
      if (!SOLic) return false; // (shouldn't happen)
      acct.facts.seatOverage = {
        EXT_PRODUCT_ID: SOLic[4],
        Category: SOLic[0],
        ITEM_NAME: "Seat Overage",
        QNTY_THRESHOLD: acct.facts.seat.QNTY_THRESHOLD,
        PRICE: "USD" ? SOLic[2] : SOLic[3],
        DISCOUNT: 0,
        NiCPrice: acct.facts.seat.NiCPrice,
        CURRENCY: acct.CURRENCY,
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
          /^307-/.test(e.EXT_PRODUCT_ID) &&
          ((e.Category !== acct.facts.seatOverage.Category &&
            e.Category !== acct.facts.seat.Category) ||
            e.QNTY_THRESHOLD == 0) &&
          acct.logInfo(
            this.name,
            `Removed: ${e.EXT_PRODUCT_ID} ${e.ITEM_NAME}, parent "${e.PARENT}", qtty ${e.QNTY_THRESHOLD}`
          )
        )
    );
    return true;
  }
}

//////////
class RCPorts4Seats extends Rule {
  constructor() {
    super({
      description:
        "Checks if the Additional Port licenses matches the Seat license",
    });
  }
  action(acct) {
    if (!Rule.portMap.hasOwnProperty(acct.facts.seatOverage.Category)) {
      const theIssue = `Unknown port2seat mapping: ${acct.facts.seatOverage.Category}`;
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
      description: "Check/Fix Port Overage license",
    });
  }
  action(acct) {
    const entPorts = acct.ents.filter(
      (row) =>
        /^308-/.test(row.EXT_PRODUCT_ID) && row.ProductFamily === "Overage"
    );

    if (entPorts.length === 0) {
      acct.logWarning(
        this.name,
        "RC Port Overage license was not found. NEEDS ATTENTION!"
      );
      return true;
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
          Rule.portMap[acct.facts.seatOverage.Category].findIndex(
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
      description: "Removes Overage licenses that were not explicitly ordered",
    });
  }
  action(acct) {
    acct.ents = acct.ents.filter(
      (e) =>
        !(
          (e.ProductFamily === OVERAGE &&
            e.Category !== "LASRO" &&
            e.EXT_PRODUCT_ID !== "610064-000-000" &&
            e.EXT_PRODUCT_ID !== "610064-302-000" &&
            acct.cases.findIndex(
              (c) => c.skuid === e.EXT_PRODUCT_ID && c.qtty > 0
            ) === -1 &&
            acct.nics.findIndex((n) => n.SKU === e.EXT_PRODUCT_ID) === -1 &&
            acct.logInfo(
              this.name,
              `Removed: ${e.EXT_PRODUCT_ID} ${e.ITBS_NAME}`
            )) ||
          (e.ProductFamily === OVERAGE &&
            ["3875-1292-000", "3875-1290-000", "3875-1289-000"].includes(
              e.EXT_PRODUCT_ID
            ) &&
            acct.logWarning(
              this.name,
              `Removed: ${e.EXT_PRODUCT_ID} ${e.ITBS_NAME} (NEEDS ATTENTION)`
            ))
        )
    );
    return true;
  }
}

/////////////
class RCFixTextelOvs extends Rule {
  constructor() {
    super({
      description: "Replace Textel batch Overages",
    });
  }
  action(acct) {
    const textelOverage = acct.ents.find(
      (t) => !t.ITEM_NAME && t.EXT_PRODUCT_ID.startsWith("3875-12")
    );
    if (textelOverage) {
      textelOverage.ITEM_NAME = "Testel - Overage";
      textelOverage.EXT_PRODUCT_ID = "";
      textelOverage.Category = "LTXTO";
      textelOverage.PRICE = 0.04;
      textelOverage.DISCOUNT = 0.0;
      textelOverage.QNTY_THRESHOLD = 0;
    }
    return true;
  }
}

/////////////
class RCEntCheckDuplicates extends Rule {
  constructor() {
    super({
      description:
        "Checks if there are duplicates in result of name-less matching with the catalog",
    });
  }
  action(acct) {
    //4107-645-000:
    if (acct.ents.findIndex((e) => e.Category === "LAURCRDA") > -1) {
      acct.ents = acct.ents.filter(
        (e) => e.Category !== "LWEMAUREC" && e.Category !== "LWEMAURECO"
      );
    }
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
  constructor() {
    super({
      description: "Corrects outdated prices for certain usage licenses",
    });
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
class RCNegDiscounts extends Rule {
  constructor() {
    super({
      description:
        "Sanity check: Rejects the migration if negative discount was found",
    });
  }
  action(acct) {
    const negs = acct.ents.filter((e) => e.DISCOUNT < 0);
    negs.forEach((neg) => {
      acct.logError(
        this.name,
        `Negative discount ${neg.DISCOUNT} for: ${neg.EXT_PRODUCT_ID} ${neg.ITEM_NAME}`
      );
    });
    return negs.length === 0;
  }
}

//////////////////
class RCOldTelco extends Rule {
  constructor() {
    super({
      description: "Deletes old Telecom Licenses",
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
      description: "Adds Free Domestic Telephony Licenses",
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
        acct.logInfo(this.name, `Added: ${tl.Category} ${tl.ITEM_NAME}`);
      }
    });
    return true;
  }
}

//////////////////
class RCASROverage extends Rule {
  constructor() {
    super({
      description:
        "Adds the ASR Overage License - if it was originally omitted",
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
      description: "Converts different-size toll-free bundles to 25K ones",
    });
  }
  action(acct) {
    const batchPattern =
      /Contact Center: (?<Mega>\d+M )?(?<Kilo>\d+K )?(Domestic )?Minutes Bundle/;

    acct.ents = acct.ents.filter(
      (e) =>
        !("ITBS_NAME" in e && e.ITBS_NAME.match(batchPattern)) ||
        e.QNTY_THRESHOLD > 0 ||
        !acct.logInfo(this.name, `Deleted: "${e.ITBS_NAME}" with zero quantity`)
    );

    acct.ents
      .filter((e) => "ITBS_NAME" in e && e.ITBS_NAME.match(batchPattern))
      .forEach((bundle) => {
        acct.logInfo(
          this.name,
          `Replaced: "${bundle.ITBS_NAME}" with 25K bundles`
        );

        const { Mega, Kilo } = bundle.ITBS_NAME.match(batchPattern).groups;
        const qtty25k =
          (Mega ? 40 * Mega.slice(0, -2) : 0) +
          (Kilo ? 0.04 * Kilo.slice(0, -2) : 0);

        bundle.Category = Rule.BUNDLE25K.Category;
        bundle.ITEM_NAME = Rule.BUNDLE25K.ITEM_NAME;
        bundle.QNTY_THRESHOLD = qtty25k * bundle.QNTY_THRESHOLD;
        bundle.PRICE =
          bundle.CURRENCY === "USD" ? Rule.BUNDLE25K.USD : Rule.BUNDLE25K.CAD;
        bundle.DISCOUNT = bundle.PRICE - bundle.OldPrice / qtty25k;
        //        bundle.ProductFamily = OVERAGE;
      });
    return true;
  }
}

//////////////////
class RCFixSocMedia extends Rule {
  constructor() {
    super({
      description: "Fixes Social Media Overages",
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
        "RC: Removes the _XX suffix in C2C (to enable further matching)",
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
        "Checks if there are licenses in Monthly which are absent in RC entitlements",
    });
  }
  action(acct) {
    let rule_res = true;
    acct.nics.forEach((nl) => {
      const entLic = acct.ents.find((el) => nl.SKU === el.EXT_PRODUCT_ID);
      if (entLic === undefined) {
        if (Rule.Exceptions.find((ex) => nl.SKU === ex) !== undefined) {
          acct.logWarning(
            this.name,
            `${nl.SKU} ($${
              nl.Amount
            }) was found in NiC MRC file but not in RC entitlements (Known exception). ${
              nl.Amount > 0.0 ? "NEEDS ATTENTION!" : ""
            }`
          );
        } else if (nl.Amount <= 0.0) {
          acct.logWarning(
            this.name,
            `${nl.SKU} ($${nl.Amount}) was found in NiC MRC file but not in RC entitlements. NEEDS ATTENTION!`
          );
        } else {
          acct.logError(
            this.name,
            `${nl.SKU} ($${nl.Amount}) was found in NiC MRC file but not in RC entitlements`
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
      description: "Checks if the account is represented in Monthly",
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
        "Checks if there are licenses in Monthly which are absent in cases - and add them",
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
          acct.logWarning(
            this.name,
            `${nl.SKU} was not found in case2case and entitlements but is presented in Monthly file. CANNOT BE RESTORED!`
          );
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
      description: "Checks/Fixes NiC port licenses",
    });
  }
  action(acct) {
    if ("entPortLic" in acct.facts) {
      const casePortLic = acct.cases.find((c) => /^308-/.test(c.skuid));
      if (casePortLic === undefined) {
        acct.logWarning(
          this.name,
          "NiC PortOverage license was not found. Added ${acct.facts.entPortLic.EXT_PRODUCT_ID} to match Entitlements"
        );
        acct.cases.push({
          skuid: acct.facts.entPortLic.EXT_PRODUCT_ID,
          sku: acct.facts.entPortLic.ITBS_NAME,
          qtty: acct.facts.entPortLic.QNTY_THRESHOLD,
          price: acct.facts.entPortLic.NiCPrice,
        });
      } else if (casePortLic.skuid !== acct.facts.entPortLic.EXT_PRODUCT_ID) {
        acct.logWarning(
          this.name,
          `inContact port ${casePortLic.skuid} replaced by ${acct.facts.entPortLic.EXT_PRODUCT_ID} to match Entitlements`
        );
        casePortLic.skuid = acct.facts.entPortLic.EXT_PRODUCT_ID;
      }
    }
    return true;
  }
}

//////////////////////////////////
export class RuleEngine {
  constructor() {
    this.rules = [
      new RCCheckSeats(),
      new RCCSeatOverage(),
      new RCPorts4Seats(),
      new RCFixPorts(),
      new RCExtraOverages(),
      new RCFixTextelOvs(),
      new RCEntCheckDuplicates(),
      new RCEntNaming(),
      new RCFixPrices2(),
      new RCNegDiscounts(),
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
