class Entitlement {
  extProductID;
  itemName;
  qttyThreshold = 0;
  extPrice = 0.0;
  constructor(extProductID, itemName, qttyThreshold, extPrice) {
    this.extProductID = extProductID;
    this.itemName = itemName;
    this.qttyThreshold = qttyThreshold;
    this.extPrice = extPrice;
  }
}

class EntITBS extends Entitlement {
  category;
  oldPrice;
  price;
  discount;
  currency;
  productFamily;
  parent;
  batchID;
  constructor(pars) {
    super(pars.extProductID, pars.itemName, pars.qttyThreshold, pars.extPrice);
    this.category = pars.category;
    this.oldPrice = pars.oldPrice;
    this.price = pars.price;
    this.discount = pars.discount;
    this.currency = pars.currency;
    this.productFamily = pars.productFamily;
    this.parent = pars.parent;
    this.batchID = pars.batchID;
  }
  static newFromDBRecord(dbrec) {
    return new EntITBS({
      extProductID: dbrec.EXT_PRODUCT_ID,
      itemName: dbrec.ITEM_NAME,
      qttyThreshold: dbrec.QNTY_THRESHOLD,
      extPrice: dbrec.NiCPrice,
      category: dbrec.Category,
      oldPrice: dbrec.OldPrice,
      price: dbrec.PRICE,
      discount: dbrec.DISCOUNT,
      currency: dbrec.CURRENCY,
      productFamily: dbrec.ProductFamily,
      parent: dbrec.Parent,
      batchID: dbrec.batchID,
    });
  }
}

class EntMRC extends Entitlement {
  amount = 0;
  constructor(pars) {
    super(pars.extProductID, pars.itemName, pars.qttyThreshold, pars.extPrice);
    this.amount = pars.amount;
  }
  static newFromDBRecord(dbrec) {
    return new EntMRC({
      extProductID: dbrec.SKU,
      itemName: dbrec.Product,
      qttyThreshold: dbrec.Quantity,
      extPrice: dbrec.Price,
      amount: dbrec.amount,
    });
  }
}

class EntC2C extends Entitlement {
  subject = "";
  provisionDate;
  operation;
  constructor(pars) {
    super(pars.extProductID, pars.itemName, pars.qttyThreshold, pars.extPrice);
    this.subject = pars.subject;
    this.provisionDate = pars.provisionDate;
    this.operation = pars.operation;
  }
  static newFromDBRecord(dbrec) {
    return new EntC2C({
      extProductID: dbrec.skuid,
      itemName: dbrec.sku,
      qttyThreshold: dbrec.qtty,
      extPrice: dbrec.price,
      subject: dbrec.Subject,
      provisionDate: dbrec.ProvisionDate,
      operation: dbrec.operation,
    });
  }
}

/////////////
class EntCollection {
  constructor(coll) {
    this.originalColl = coll;
  }
}

////////////////////
export class NgbsEntitlements extends EntCollection {
  static SQL = `
    SELECT 
        EXT_PRODUCT_ID,
        Category,
        ITEM_NAME,
        ITBS_NAME,
        QNTY_THRESHOLD,
        OldPrice,
        CASE CURRENCY_CODE WHEN 'USD' THEN round(PRICEUSD,2) WHEN 'CAD' THEN round(PRICE,2) END PRICE,
        CASE CURRENCY_CODE WHEN 'USD' THEN round(DiscountUSD,2) WHEN 'CAD' THEN round(Discount,2) END DISCOUNT,
        CURRENCY_CODE AS CURRENCY,
        round(NiCPrice,2) NiCPrice,
        ProductFamily,
        Parent,
        ? AS batchID
    FROM ?
    WHERE eid=?
    ORDER BY AccountName, QNTY_THRESHOLD DESC, cast(EXT_PRODUCT_ID AS INTEGER), EXT_PRODUCT_ID, Category
    `.replace(/\s+/g, " ");

  constructor(coll) {
    super(coll);
    this.ents = JSON.parse(JSON.stringify(coll)); //Deep copy of coll
  }
  get wrkColl() {
    return this.ents;
  }
  set wrkColl(newColl) {
    this.ents = newColl;
  }
}

//////////////////
export class NiCEntitlements extends EntCollection {
  static SQL = `
    SELECT 
        *,
        CatalogID || '-' || 
        CASE WHEN FeatureID='' OR  FeatureID IS NULL THEN '000' ELSE FeatureID END || '-' || 
        CASE WHEN FeatureDetailID='' OR  FeatureDetailID IS NULL THEN '000' ELSE FeatureDetailID END 
        AS SKU,
        CAST(Amount AS REAL)/Quantity AS Price
    FROM RCMRCSummary
    WHERE Account=?
        AND BillingPeriodStart=?
        AND ProductType='MRC'
    ORDER BY cast(CatalogID as INTEGER), CatalogID
    `.replace(/\s+/g, " ");

  constructor(coll) {
    super(coll);
    this.nics = JSON.parse(JSON.stringify(coll));
  }
  get wrkColl() {
    return this.nics;
  }
}

////////////////////
export class CaseEntitlements extends EntCollection {
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
        AND nic_cases.CaseNumber=sfdcCase
    ORDER BY 
        ProvisionDate DESC,
        cast(skuid as INTEGER)
    `.replace(/\s+/g, " ");

  constructor(coll) {
    super(coll);
    this.c2c = this.consColl;
  }

  get wrkColl() {
    return this.c2c;
  }

  set wrkColl(newColl) {
    this.c2c = newColl;
  }

  get consColl() {
    const replacements = {
      RC_STAN: "307-6-216",
      RC_PREM: "307-6-217",
    };

    return this.originalColl.reduce((acc, obj) => {
      const theLic =
        obj.skuid in replacements ? replacements[obj.skuid] : obj.skuid;

      const findObj = acc.find((alreadyIn) => alreadyIn.skuid === theLic);
      if (findObj === undefined) {
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
        findObj.qtty += obj.qtty;
        findObj.oper = obj.oper; // last oparation
      }
      return acc;
    }, []);
  }
}
