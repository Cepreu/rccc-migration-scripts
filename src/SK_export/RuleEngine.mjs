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
    const price = acct.CURRENCY === "USD" ? tl.PRICE_USD : tl.PRICE_CAD;

    if (tl.productFamily === OVERAGE) months = 1;
    else if (!months && acct.info.BILLING_TERM === "Annual") months = 12;

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
    const c2c = {
      accountID: account.info.ENTERPRISE_ACCOUNT_ID,
      BUID: account.info.INCONTACT_BUID,
      skuid: skuid,
      sku: sku || tl.NIC_NAME,
      price: price || tl.NIC_PRICE,
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
    productFamily = RECURRING,
    batchID = "",
    correctICB = false,
  }) {
    const tl = Legacy.catalog.find(
      (l) =>
        l.SKU === sku &&
        (productFamily === RECURRING
          ? l.ProductFamily != "Overage"
          : (l.ProductFamily = "Overage"))
    );
    if (!tl)
      throw new Error(`${sku} - ${productFamily} was not found in the catalog`);

    acct.ents.push({
      ENTERPRISE_ACCOUNT_ID: acct.info.ENTERPRISE_ACCOUNT_ID,
      EXT_PRODUCT_ID: sku,
      Category: `CCL_${tl.L_CATEGORY}_${tl.No}`,
      ITEM_NAME: tl.PRODUCT_NAME,
      QNTY_THRESHOLD: qtty,
      PRICE: Rule.ChoosePrice(acct, tl, 1),
      DISCOUNT: 0,
      NiCPrice: 0,
      CURRENCY: acct.CURRENCY,
      ProductFamily: productFamily,
      batchID: batchID,
    });

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
        BILLING_ITEM_ID: "1",
      });
    }
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

    ent.PRICE = Rule.ChoosePrice(acct, tl);
    ent.DISCOUNT = 0;

    const icb_ent = acct.icb_ents.find(
      (icb) =>
        icb.EXT_PRODUCT_ID === ent.EXT_PRODUCT_ID &&
        icb.productFamily === ent.productFamily
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
