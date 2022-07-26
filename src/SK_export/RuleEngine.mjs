const RECURRING = "Recurring";
const OVERAGE = "Overage";

export class Rule {
  static Registered = [];
  static Register(descr) {
    this.Registered.push({
      Rule: this.name,
      Description: descr,
      Action: new this(),
    });
  }
  static GetDescriptions() {
    return this.Registered;
  }

  static seatOverageMap = [
    {
      Category: "LRCCCA1SEATO",
      PARENT: "Contact Center: Advanced Edition Seat",
      PRICE_USD: 139.99,
      PRICE_CAD: 179.99,
      EXT_PRODUCT_ID: "307-6-216",
    },
    {
      Category: "LRCCCA2SEATO",
      PARENT: "Contact Center: Advanced Edition Seat (2 ports)",
      PRICE_USD: 179.99,
      PRICE_CAD: 229.99,
      EXT_PRODUCT_ID: "307-6-291",
    },
    {
      Category: "LRCCCACSEATO",
      PARENT: "Contact Center: Advanced Edition Concurrent Seat",
      PRICE_USD: 259.99,
      PRICE_CAD: 334.99,
      EXT_PRODUCT_ID: "307-6-289",
    },
    {
      Category: "LRCCCAPSEATO",
      PARENT: "Contact Center: Advanced-Plus Edition Seat",
      PRICE_USD: 169.99,
      PRICE_CAD: 209.99,
      EXT_PRODUCT_ID: "307-6-270",
    },
    {
      Category: "LRCCCBASEATO",
      PARENT: "Contact Center: Basic Edition Seat with Advanced IVR (2 ports)",
      PRICE_USD: 179.99,
      PRICE_CAD: 231.19,
      EXT_PRODUCT_ID: "307-6-287",
    },
    {
      Category: "LRCCCBCSEATO",
      PARENT: "Contact Center: Basic Edition Concurrent Seat",
      PRICE_USD: 214.99,
      PRICE_CAD: 274.99,
      EXT_PRODUCT_ID: "307-6-284",
    },
    {
      Category: "LRCCCBCWASEATO",
      PARENT: "Contact Center: Basic Edition Concurrent Seat with Advanced IVR",
      PRICE_USD: 259.99,
      PRICE_CAD: 336.78,
      EXT_PRODUCT_ID: "307-6-288",
    },
    {
      Category: "LRCCCBSEATO",
      PARENT: "Contact Center: Basic Edition Seat",
      PRICE_USD: 149.99,
      PRICE_CAD: 169.99,
      EXT_PRODUCT_ID: "307-6-216",
    },
    {
      Category: "LRCCCPCINUSEATO",
      PARENT: "Contact Center: PCI Level 1 Edition Seat (per Named-User)",
      PRICE_USD: 187,
      PRICE_CAD: 250,
      EXT_PRODUCT_ID: "307-6-218",
    },
    {
      Category: "LRCCCPCISEATO",
      PARENT:
        "Contact Center: PCI Level 1 Edition Seat (per Configured Station)",
      PRICE_USD: 230,
      PRICE_CAD: 300,
      EXT_PRODUCT_ID: "307-4-220",
    },
    {
      Category: "LRCCCSSEATO",
      PARENT: "Contact Center: Configured Station License",
      PRICE_USD: 195,
      PRICE_CAD: 254,
      EXT_PRODUCT_ID: "307-4-178",
    },
    {
      Category: "LRCCCU2SEATO",
      PARENT: "Contact Center: Ultimate Edition Seat (2.5 ports)",
      PRICE_USD: 219.99,
      PRICE_CAD: 279.99,
      EXT_PRODUCT_ID: "307-6-292",
    },
    {
      Category: "LRCCCUCSEATO",
      PARENT: "Contact Center: Ultimate Edition Concurrent Seat",
      PRICE_USD: 319.99,
      PRICE_CAD: 409.99,
      EXT_PRODUCT_ID: "307-6-290",
    },
    {
      Category: "LRCCCUPSEATO",
      PARENT: "Contact Center: Ultimate-Plus Edition Seat",
      PRICE_USD: 199.99,
      PRICE_CAD: 259.99,
      EXT_PRODUCT_ID: "307-6-271",
    },
    {
      Category: "LRCCCUSEATO",
      PARENT: "Contact Center: Ultimate Edition Seat",
      PRICE_USD: 199.99,
      PRICE_CAD: 259.99,
      EXT_PRODUCT_ID: "307-6-217",
    },
    {
      Category: "LRCCSEATUESO",
      PARENT: "Contact Center: Ultimate Edition Seat (3 ports)",
      PRICE_USD: 190,
      PRICE_CAD: 235,
      EXT_PRODUCT_ID: "12658-1727-001",
    },
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
    CAD: 455.0,
  };

  static IsException(nl) {
    return (
      [
        "1561-49-000", // Service Package - CXsuccess Care Package
        "3157-18-204", // Chat  and Email Channel - CXone Chat & Email (per Configured User)
        "1028-171-000", // SIP Trunking Service - CXone SIP Connectivity over Internet
        "610148-597-000", // NICE Training - IEX WFM Integrated Training
        "610060-296-000", // "Contact Center: Instructor-Led Interactive Training (At Customer Facility; min 2"
        "154-487-000", // SMS/MMS Setup
        "154-493-000", // SMS/MMS Setup
        "154-173-000", // SMS/MMS Setup
      ].find((ex) => nl.SKU === ex) !== undefined
    );
  }

  get name() {
    return this.constructor.name;
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
      const SOLic = Rule.seatOverageMap.find(
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
        QNTY_THRESHOLD: acct.facts.seat.QNTY_THRESHOLD,
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
  static {
    super.Register(
      "Checks if the Additional Port licenses matches the Seat license"
    );
  }
  action(acct) {
    return (
      Rule.portMap.hasOwnProperty(acct.facts.seatOverage.Category) ||
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
      acct.logAlarm(
        this.name,
        "RC Port Overage license was not found. NEEDS ATTENTION!"
      );
      return true;
    }

    const port = entPorts.find(
      (e) =>
        !!Rule.portMap[acct.facts.seatOverage.Category].find(
          (p) => p === e.Category
        )
    ); // Expected port by seat type
    if (port !== undefined) {
      acct.facts.entPortLic = port;
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
class RecurringPorts extends Rule {
  static {
    super.Register("Syncs Port Overages with Recurring Ports");
  }
  action(acct) {
    const RecurringPort = acct.ents.find(
      (row) =>
        /^308-/.test(row.EXT_PRODUCT_ID) && row.ProductFamily === "Recurring"
    );
    if (
      !!RecurringPort &&
      !!acct.facts.entPortLic &&
      RecurringPort.EXT_PRODUCT_ID !== acct.facts.entPortLic.EXT_PRODUCT_ID
    ) {
      acct.logAlarm(
        this.name,
        `Recurring Port license ${RecurringPort.EXT_PRODUCT_ID} doesn't match Overage: ${acct.facts.entPortLic.EXT_PRODUCT_ID}. Overage replaced by ${RecurringPort.EXT_PRODUCT_ID}`
      );

      const raw_port_ovr = acct.raw_ents.find(
        (re) => re.EXT_PRODUCT_ID === acct.facts.entPortLic.EXT_PRODUCT_ID
      );
      raw_port_ovr.EXT_PRODUCT_ID = RecurringPort.EXT_PRODUCT_ID;

      acct.facts.entPortLic.EXT_PRODUCT_ID = RecurringPort.EXT_PRODUCT_ID;
      const mapping = {
        "308-8-167": { rec: "LAPRTA", ovr: "LAPRTACSO" },
        "308-8-214": { rec: "LAPRTBA", ovr: "LAPRTAAEO" },
        "308-8-215": { rec: "LAPRTBAU", ovr: "LAPRTAUEO" },
      };
      acct.facts.entPortLic.Category =
        mapping[RecurringPort.EXT_PRODUCT_ID].ovr;

      const nicPort = acct.nics.find((nic) => /^308-/.test(nic.SKU));
      if (!!nicPort && nicPort.SKU !== acct.facts.entPortLic.EXT_PRODUCT_ID) {
        nicPort.SKU = acct.facts.entPortLic.EXT_PRODUCT_ID;
      }
    }
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
      const casePort = acct.cases.find((c) => /^308-/.test(c.skuid));
      if (casePort === undefined) {
        acct.cases.push({
          ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
          accountID: acct.info.ENTERPRISE_ACCOUNT_ID,
          BUID: acct.info.INCONTACT_BUID,
          skuid: acct.facts.entPortLic.EXT_PRODUCT_ID,
          sku: "Additional Configured Universal Port",
          qtty: 0,
          price: acct.facts.entPortLic.NiCPrice,
        });
        acct.logWarning(
          this.name,
          `C2C Port Overage license was not found. Added ${acct.facts.entPortLic.EXT_PRODUCT_ID} from Entitlements`
        );
      } else if (casePort.skuid !== acct.facts.entPortLic.EXT_PRODUCT_ID) {
        acct.logWarning(
          this.name,
          `NiC Port license ${casePort.skuid} doesn't match RC entitlements: ${acct.facts.entPortLic.EXT_PRODUCT_ID}. Action: Replaced by RC`
        );
        casePort.skuid = acct.facts.entPortLic.EXT_PRODUCT_ID;
      }
    }
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
            e.EXT_PRODUCT_ID !== "610064-000-000" && //PS OnDemand
            e.EXT_PRODUCT_ID !== "610064-302-000" && //PS OnDemand - Professional Services On Demand
            !acct.cases.find(
              (c) =>
                c.skuid === e.EXT_PRODUCT_ID && (c.qtty > 0 || c.oper === "ADD")
            ) &&
            !acct.nics.find((n) => n.SKU === e.EXT_PRODUCT_ID) &&
            acct.logInfo(
              this.name,
              `Removed ${e.Category ? e.Category : ""}: ${e.EXT_PRODUCT_ID} ${
                e.ITBS_NAME
              }`
            )) ||
          (e.ProductFamily === OVERAGE &&
            ["3875-1292-000", "3875-1290-000", "3875-1289-000"].includes(
              e.EXT_PRODUCT_ID
            ) &&
            acct.logAlarm(
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
    if (!!acct.ents.find((e) => e.Category === "LAURCRDA")) {
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
    Rule.RCOTelecomLicenses.forEach((tl) => {
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
    if (
      acct.ents.find((e) => e.Category === Rule.ASR_OVERAGE.Category) ===
      undefined
    ) {
      acct.ents.push({
        ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
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
  static {
    super.Register("Converts different-size toll-free bundles to 25K ones");
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
class NiC_NotFound extends Rule {
  static {
    super.Register("Checks if the account is represented in Monthly");
  }
  action(acct) {
    return !(
      acct.nics.length === 0 &&
      acct.logError(
        this.name,
        `No records were found for the account in the Monthly file`
      )
    );
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
        acct.logWarning(
          this.name,
          `${c2c.skuid} was not found in Monthly file but is presented in case2case`
        );
        if (entLic) {
          const skuArr = c2c.skuid.split("-");
          acct.nics.push({
            Account: acct.info.INCONTACT_BUID,
            Customer: acct.info.AccountName,
            ProductType: "MRC",
            CatalogID: skuArr[0],
            FeatureID: skuArr[1],
            FeatureDetailID: skuArr[2],
            Product: c2c.sku,
            Quantity: 0,
            Amount: 0,
            SKU: c2c.skuid,
          });

          // Address1
          // Address2
          // City
          // State
          // ZipCode
          // Invoice
          // BillingPeriodStart
          // BillingPeriodEnd
          // InvoiceDate
          // DueDate

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
        if (!Rule.IsException(nl)) {
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
class NiC_MRCvsC2C extends Rule {
  static {
    super.Register(
      "Checks if there are licenses in Monthly which are absent in cases - and adds them"
    );
  }
  action(acct) {
    let rule_res = true;
    acct.nics.forEach((nl) => {
      const caseLic = acct.cases.find((cl) => nl.SKU === cl.skuid);
      if (caseLic === undefined && Rule.IsException(nl)) {
        const entLic = acct.ents.find((el) => nl.SKU === el.EXT_PRODUCT_ID);
        if (entLic === undefined) {
          acct.logAlarm(
            this.name,
            `${nl.SKU} was not found in case2case and entitlements but is presented in Monthly file. NEEDS ATTENTION!`
          );
          return;
        }
        if (nl.Quantity > 0) {
          acct.cases.push({
            accountID: acct.info.ENTERPRISE_ACCOUNT_ID,
            BUID: acct.info.INCONTACT_BUID,
            skuid: nl.SKU,
            sku: nl.Product,
            qtty: entLic.QNTY_THRESHOLD,
            price: nl.Amount / nl.Quantity,
          });
          const theIssue = `${nl.SKU} was not found in case2case but is presented in Monthly file`;
          acct.logWarning(this.name, theIssue);
        } else {
          acct.cases.push({
            accountID: acct.info.ENTERPRISE_ACCOUNT_ID,
            BUID: acct.info.INCONTACT_BUID,
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
  static {
    super.Register(
      "Checks if there are no acct.problems with mapping ITBS licenses to NGBS catalog"
    );
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
class QntyVsThrsh extends Rule {
  static {
    super.Register("Checks recurring QNTYs vs overages thresholds");
  }
  action(acct) {
    let isOK = true;
    acct.ents
      .filter(
        (row) => row.ProductFamily === RECURRING && row.EXT_PRODUCT_ID !== null
      )
      .forEach((r) => {
        const overage = acct.ents.find(
          (o) =>
            o.ProductFamily === OVERAGE &&
            o.EXT_PRODUCT_ID === r.EXT_PRODUCT_ID &&
            o.QNTY_THRESHOLD !== r.QNTY_THRESHOLD
        );
        if (overage) {
          acct.logAlarm(
            this.name,
            `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - Recurring qnty (${r.QNTY_THRESHOLD}) is not equal to overage (${overage.QNTY_THRESHOLD}) - NEEDS ATTENTION!`
          );
        }
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
    let isOK = true;
    acct.ents
      .filter(
        (row) => row.ProductFamily === RECURRING && row.EXT_PRODUCT_ID !== null
      )
      .forEach((r) => {
        const nic = acct.cases.find(
          (c) =>
            c.skuid === r.EXT_PRODUCT_ID &&
            c.qtty !== r.QNTY_THRESHOLD &&
            r.EXT_PRODUCT_ID != acct.facts.entPortLic.EXT_PRODUCT_ID
        );
        if (nic) {
          if (acct.facts.NBU) {
            acct.logError(
              this.name,
              `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - Recurring qnty (${r.QNTY_THRESHOLD}) is not equal to NiC (${nic.qtty}) while NBU was found`
            );
            isOK = false;
          } else {
            acct.logWarning(
              this.name,
              `${r.EXT_PRODUCT_ID} ${r.ITBS_NAME} - NiC case qnty (${nic.qtty}) is corrected to Recurring qnty (${r.QNTY_THRESHOLD}) - no NBU case found`
            );
            nic.qtty = r.QNTY_THRESHOLD;
          }
        }
      });
    return isOK;
  }
}

//////////////////
class C2CtoVenCat extends Rule {
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
              `${c2c.skuid} was removed from Vendor catalog as obsolete`
            )) ||
            acct.logWarning(
              this.name,
              `${c2c.skuid} was removed from Vendor catalog: Qnty: ${c2c.qtty}`
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
