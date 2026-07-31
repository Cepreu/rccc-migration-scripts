import { Legacy } from "./LegacyCatalog.js";
import type { Account } from "./Account.js";
import type { DataRow } from "../types.js";
const RECURRING = "Recurring";
const OVERAGE = "Overage";

interface RuleRegistration {
  Rule: string;
  Description: string;
  Action: Rule;
}

interface AddCaseOptions {
  account: Account;
  skuid: string;
  sku?: string;
  price?: number;
  qtty?: number;
  oper?: string;
  addNiC?: boolean;
}

interface AddNiCOptions {
  account: Account;
  skuid: string;
  sku?: string;
  qtty?: number;
  price?: number;
}

interface AddEntitlementOptions {
  acct: Account;
  sku: string;
  qtty: number;
  price?: number;
  productFamily?: string;
  batchID?: string;
  correctICB?: boolean;
}

export class Rule {
  static Registered: RuleRegistration[] = [];
  static Register(descr: string) {
    this.Registered.push({
      Rule: this.name,
      Description: descr,
      Action: new this(),
    });
  }
  static GetDescriptions() {
    return this.Registered;
  }

  static ChoosePrice(acct: Account, tl: DataRow, months?: number) {
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

    if (tl.PRODUCT_FAMILY === OVERAGE) months = 1;
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
  }: AddCaseOptions) {
    const tl = Legacy.catalog.find((l) => l.SKU === skuid);
    const resolvedSku = sku ?? tl?.NIC_NAME ?? tl?.PRODUCT_NAME;
    if (!resolvedSku) {
      throw new Error(`Catalog mapping not found for SKU ${skuid}`);
    }
    const c2c = {
      accountID: account.info.ENTERPRISE_ACCOUNT_ID,
      BUID: account.info.INCONTACT_BUID,
      skuid: skuid,
      sku: resolvedSku,
      price: price ?? tl?.NIC_PRICE ?? 0,
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

  static AddNiC({
    account,
    skuid,
    sku,
    qtty = 0,
    price = 0,
  }: AddNiCOptions) {
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
  }: AddEntitlementOptions) {
    const tl = Legacy.catalog.find(
      (l) =>
        l.SKU === sku &&
        ((l.PRODUCT_FAMILY !== OVERAGE && productFamily === RECURRING) ||
          (l.PRODUCT_FAMILY === OVERAGE && productFamily === OVERAGE))
    );
    if (!tl) {
      throw new Error(`${sku} - ${productFamily} was not found in the catalog`);
    }

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

  static FixPrice(acct: Account, ent: DataRow) {
    const tl = Legacy.catalog.find(
      (l) =>
        l.SKU === ent.EXT_PRODUCT_ID &&
        (ent.ProductFamily === RECURRING
          ? l.PRODUCT_FAMILY !== OVERAGE
          : l.PRODUCT_FAMILY === OVERAGE)
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

  action(_account: Account): boolean {
    throw new Error(`${this.name} does not implement action()`);
  }
}
