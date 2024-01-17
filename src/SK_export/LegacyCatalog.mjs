import { db } from "../utils/DBSingleton.mjs";

export class Legacy {
  static catalog = db.prepare(`SELECT * FROM catalogSFDC`).all();

  static telcoms = [
    "LICIBL",
    "LICIBTF",
    "LICIBINT",
    "LICOBLC",
    "LICOBIC",
    "LICOBDL",
    "LICOBDINT",
    "LICOBLTF",
  ];

  static ASR_SKU = "3615-000-000"; //Contact Center: Automated Speech Recognition (per minute)

  static portMap = {
    CCL_LRCCCA1SEATO_14: ["CCL_LAPRTBESO_409"],
    CCL_LRCCCA2SEATO_67: ["CCL_LAPRTAAE2O_405", "CCL_LAPRTAAPEO_404"],
    CCL_LRCCCACSEATO_56: ["CCL_LAPRTAAECO_403"],
    CCL_LRCCCAPSEATO_26: ["CCL_LAPRTAAPEO_404"],
    CCL_LRCCCBASEATO_44: ["CCL_LAPRTBESWAO_411"],
    CCL_LRCCCBCSEATO_38: ["CCL_LAPRTABECO_400"],
    CCL_LRCCCBSEATO_8: ["CCL_LAPRTBESO_409"],
    CCL_LRCCCPCINUSEATO_77: ["CCL_LAPRTUPESO_413"],
    CCL_LRCCCSEATECNO_689: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATESSO_687: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATPESO_695: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATPSETO_697: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATSCESO_693: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATSESO_691: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATUCESO_699: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATUNCO_703: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCSEATUNLO_701: ["CCL_LADTLPORTO_705"],
    CCL_LRCCCU2SEATO_73: ["CCL_LAPRTUESO", "CCL_LAPRTUPESO_413"],
    CCL_LRCCCUCSEATO_61: ["CCL_LAPRTUPESO_413", "CCL_LAPRTAUECO_406"],
    CCL_LRCCCUPSEATO_32: ["CCL_LAPRTUPESO_413"],
    CCL_LRCCCUSEATO_20: ["CCL_LAPRTAUEO_402"],
    CCL_LRCCSEATUESO_679: ["CCL_LADTLPORTO_705"],
  };

  static IsActiveStorage(sku) {
    return [
      "309-11-171", // "NICE inContact CXone Additional Active Storage (per GB)"
      "309-11-172", // "Data Storage - NICE inContact CXone Additional Active Storage (per GB)"
      "309-1499-000", //Contact Center: Active Storage (per GB) Overage
    ].includes(sku);
  }

  static IsProServOnDemand(sku) {
    const ProServOnDemand = [
      "610064-000-000", //PS OnDemand
      "610064-302-000", //PS OnDemand - Professional Services On Demand
    ];
    return ProServOnDemand.includes(sku);
  }
  static IsException(nl) {
    const exceptions = [
      "1561-49-000", // Service Package - CXsuccess Care Package
      "3157-18-204", // Chat  and Email Channel - CXone Chat & Email (per Configured User)
      "1028-171-000", // SIP Trunking Service - CXone SIP Connectivity over Internet
      "610148-597-000", // NICE Traini0ng - IEX WFM Integrated Training
      "610060-296-000", // "Contact Center: Instructor-Led Interactive Training (At Customer Facility; min 2"
      "610186-1699-000", // SmartSync Export / Import Reports - NICE IEX WFM Integrated - Import File Schedule Changes
      "610186-904-000", // SmartSync Export / Import Reports - NICE IEX WFM Integrated - Import File Vacation Summary
      "154-487-000", // SMS/MMS Setup
      "154-493-000", // SMS/MMS Setup
      "154-173-000", // SMS/MMS Setup
      "141-000-000",
    ];
    return exceptions.includes(nl.SKU);
  }

  static IsPerBULicense(skuID) {
    return [
      "510-1337-000", // Contact Center: Surfly SSL Certificate (per BU)
      "4121-1703-000", // Contact Center: IEX WFM Integrated - Import File (Per BU)
      "3877-1414-000", // Contact Center: Frontline Database Connector (per BU)
      "3399-1755-000", // Contact Center: Feedback Management WhatsApp Channel (Per BU)
      "1561-1311-000", // Contact Center: CallVU Monthly Success Package (per BU)
      "1514-1441-000", //Contact Center: Acqueon CRM Server Plug-in (per BU)
      "1514-1442-000", //Contact Center: Acqueon IVR throttling Plug-in (per BU)
      "3875-2209-000", //	Contact Center: Textel Blast (per BU) Overage
      "3879-2212-687", // Contact Center: Textel - Long Code - Tier 1 International (USA, CAN, LTU, JEY, GBR, HUN, NLD, LUX)
      "4400-2190-000", //	Contact Center: Faster SEA Service Up to 150 Users (per BU)
      "4400-2191-000", //	Contact Center: Faster SEA Service Up to 750 Users (per BU)
      "4400-2192-000", //	Contact Center: Faster SEA Service Up to 25,000 Users (per BU)
      "4400-2193-000", //	Contact Center: Faster SEA Service Up to 50,000 Users (per BU)
      "4400-2194-000", // Contact Center: Faster SEA Service Over 50,000 Users (per BU)
      "1801-1171-000", // Messaging SMS (per BU) Overage
    ].includes(skuID);
  }

  static CanBeOrderedDirectly(skuID) {
    return [
      //During migration all such items should be added from MRC report as recurring only to NGBS
      "1010-000-000", // Contact Center: Int'l Local Number Call Path Bundle
      "1012-150-000", // Contact Center: US Local Number
      "1036-000-000", // Contact Center: TollFree Number Call Path Bundle
      "1268-000-000", // Contact Center: International Toll Free
      "1268-133-000", // Contact Center: International Toll Free - Global Toll Free Select
      "1270-136-000", // Contact Center: US Toll Free Number
      "1290-000-000", // Contact Center: Calling Name (CNAM) per US Local Number
      "3875-1296-000", // Contact Center: Textel - Long Code
      "1301-994-000", //  Contact Center: Messaging Application (per BU)
    ].includes(skuID);
  }

  static PriceExceptions = [
    "307-6-271", //Seat Overage
    "309-1499-000", //Contact Center: Active Storage (per GB) Overage
    "309-565-000", //Contact Center: Monthly Long-term Storage (per GB)
    "309-566-000", //Contact Center: Monthly Long-term Storage Retrieval (per GB)
  ];

  static IsSeat(skuID) {
    const seatPattern = /^307-(?!6-60[2,3]).*$|^1265.-.*$/; // 307-6-602, 307-6-603 are exclusions: the digital add-on; 1265* - new gen seats
    return seatPattern.test(skuID);
  }

  static IsByBusinessUnit(sku) {
    const ByBusinesUnitLics = ["1301-994-000", "1032-173-000"];
    return ByBusinesUnitLics.includes(sku);
  }
  static IsTelcoLic(sku) {
    const TelcoLics = ["3875-1292-000", "3875-1290-000", "3875-1289-000"];
    return TelcoLics.includes(sku);
  }

  static {
    this.seatOverageMap = Legacy.catalog
      .filter((lic) => lic.PRODUCT_NAME === "Seat Overage")
      .map((lic) => {
        return {
          Category: `CCL_${lic.L_CATEGORY}_${lic.No}`,
          PARENT: lic.PARENT,
          PRICE_USD: lic.PRICE_USD,
          PRICE_CAD: lic.PRICE_CAD,
          EXT_PRODUCT_ID: lic.SKU,
        };
      });

    const assign = (l) => {
      return {
        Category: `CCL_${l.L_CATEGORY}_${l.No}`,
        ITEM_NAME: l.PRODUCT_NAME,
        USD: l.PRICE_USD,
        CAD: l.PRICE_CAD,
        NiCPrice: l.NIC_PRICE,
      };
    };
    this.RCOTelecomLicenses = Legacy.catalog
      .filter((l) => Legacy.telcoms.includes(l.L_CATEGORY))
      .map((l) => assign(l));
  }
}
