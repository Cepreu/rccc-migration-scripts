import { Legacy } from "./LegacyCatalog.mjs";
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

  static ChoosePrice(acct, tl, months) {
    const price =
      acct.CURRENCY === "USD"
        ? tl.PRICE_USD
        : acct.CURRENCY === "AUD"
        ? tl.PRICE_AUD
        : acct.CURRENCY === "EUR"
        ? tl.PRICE_EUR
        : acct.CURRENCY === "GBP"
        ? tl.PRICE_GBP
        : tl.PRICE_CAD;

    if (tl.ProductFamily === OVERAGE) months = 1;
    if (!months)
      acct.info.BILLING_TERM === "Annual" ? (months = 12) : (months = 1);
    return price * months;
  }

  static AddCase({
    account,
    skuid,
    sku,
    price,
    qtty = 0,
    oper = "ADD",
    addNiC = false,
  }) {
    const tl = Legacy.catalog.find((l) => l.SKU === skuid);
    //console.log(skuid, "===", tl);
    const c2c = {
      accountID: account.info.ENTERPRISE_ACCOUNT_ID,
      BUID: account.info.INCONTACT_BUID,
      skuid: skuid,
      sku: sku || (tl.NIC_NAME ? tl.NIC_NAME : tl.PRODUCT_NAME),
      price: price || tl ? tl.NIC_PRICE : 0.0,
      qtty: qtty,
      oper: oper,
    };
    account.cases.push(c2c);

    if (addNiC) {
      Rule.AddNiC({
        account,
        skuid: c2c.skuid,
        sku: c2c.sku,
      });
    }
  }

  static AddNiC({ account, skuid, sku, qtty = 0, price = 0 }) {
    const skuArr = skuid.split("-");
    account.nics.push({
      Account: account.info.INCONTACT_BUID,
      Customer: account.info.AccountName,
      ProductType: "MRC",
      CatalogID: skuArr[0],
      FeatureID: skuArr[1] !== "000" ? skuArr[1] : "",
      FeatureDetailID: skuArr[2] !== "000" ? skuArr[2] : "",
      Product: sku,
      Quantity: qtty,
      Amount: qtty * price,
      SKU: skuid,
    });
  }

  static AddEntitlement({
    acct,
    sku,
    qtty,
    price,
    productFamily = RECURRING,
    batchID = "",
    correctICB = false,
  }) {
    const tl = Legacy.catalog.find(
      (l) =>
        l.SKU === sku &&
        ((l.PRODUCT_FAMILY !== OVERAGE && productFamily === RECURRING) ||
          (l.PRODUCT_FAMILY === OVERAGE && productFamily === OVERAGE))
    );
    if (!tl) {
      throw new Error(`${sku} - ${productFamily} was not found in the catalog`);
    }

    console.log(
      "price==>",
      price,
      "acct==>",
      acct.info.BILLING_TERM,
      "sku-->",
      sku,
      "family===>",
      productFamily,
      Rule.ChoosePrice(acct, tl, 1),
      Rule.ChoosePrice(acct, tl)
    );

    const newEnt = {
      ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
      EXT_PRODUCT_ID: sku,
      Category: `CCL_${tl.L_CATEGORY}_${tl.No}`,
      ITEM_NAME: tl.PRODUCT_NAME,
      QNTY_THRESHOLD: qtty,
      OldQntyThreshold: qtty,
      PRICE: Rule.ChoosePrice(acct, tl, 1),
      DISCOUNT: 0,
      NiCPrice: 0,
      CURRENCY: acct.CURRENCY,
      ProductFamily: productFamily,
      batchID: batchID,
    };
    acct.ents.push(newEnt);

    if (correctICB) {
      acct.icb_ents.push({
        ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
        EXT_PRODUCT_ID: sku,
        ITEM_NAME: tl.PRODUCT_NAME,
        QNTY_THRESHOLD: qtty,
        RETAIL_PRICE: Rule.ChoosePrice(acct, tl),
        DISCOUNT: 0,
        DISCOUNT_VALUE: 0,
        DISCOUNT_TYPE: "Currency",
        NiCPrice: 0,
        CURRENCY: acct.CURRENCY,
        TYPE_NAME: productFamily,
        STATUS_NAME: "Active",
        START_DATE: "2022-06-24 10:43",
        BILLING_ITEM_ID: sku.split("-").join(""), //meaningless number, just to have a unique id
      });
    }
    return newEnt;
  }

  static FixPrice(acct, ent) {
    const tl = Legacy.catalog.find(
      (l) =>
        l.SKU === ent.EXT_PRODUCT_ID &&
        (ent.productFamily === RECURRING
          ? l.ProductFamily != "Overage"
          : (l.ProductFamily = "Overage"))
    );
    if (!tl)
      throw new Error(
        `${ent.EXT_PRODUCT_ID} - ${ent.productFamily} was not found in the catalog`
      );

    ent.PRICE = Rule.ChoosePrice(acct, tl, 1);
    ent.DISCOUNT = 0;

    const icb_ent = acct.icb_ents.find(
      (icb) =>
        icb.EXT_PRODUCT_ID === ent.EXT_PRODUCT_ID &&
        icb.TYPE_NAME === ent.ProductFamily
    );
    if (icb_ent) {
      icb_ent.RETAIL_PRICE = ent.PRICE;
      icb_ent.DISCOUNT = ent.DISCOUNT;
    }
  }

  get name() {
    return this.constructor.name;
  }
}
