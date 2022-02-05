/////////////
class Entitlements {
    constructor(coll) {
        this.originalColl = coll
    }
}

////////////////////
class NgbsEntitlements extends Entitlements {
    static SQL = `
    SELECT 
        EXT_PRODUCT_ID,
        Category,
        ITEM_NAME,
        QNTY_THRESHOLD,
        OldPrice,
        CASE CURRENCY_CODE WHEN 'USD' THEN round(PRICEUSD,2) WHEN 'CAD' THEN round(PRICE,2) END PRICE,
        CASE CURRENCY_CODE WHEN 'USD' THEN round(DiscountUSD,2) WHEN 'CAD' THEN round(Discount,2) END DISCOUNT,
        CURRENCY_CODE AS CURRENCY,
        round(NiCPrice,2) NiCPrice,
        ProductFamily,
        ? AS batchID
    FROM ngbs_ent
    WHERE eid=?
    ORDER BY AccountName, QNTY_THRESHOLD DESC, cast(EXT_PRODUCT_ID AS INTEGER), EXT_PRODUCT_ID, Category
    `.replace(/\s+/g, " ")

    constructor(coll) {
        super(coll)
        this.ents = JSON.parse(JSON.stringify(coll))
    }
    get wrkColl() {return this.ents}
}

//////////////////
class NiCEntitlements extends Entitlements {
    static SQL = `
    SELECT 
        CatalogID || "-" || IFNULL(FeatureID,"000") || "-" || IFNULL(FeatureDetailID,"000") AS SKU,
        Product,
        Quantity,
        Amount,
        Amount/Quantity AS Price
    FROM RCMRCSummary_20211001
    WHERE Account=?
        AND ProductType="MRC"
    ORDER BY cast(CatalogID as INTEGER), CatalogID
    `.replace(/\s+/g, " ")

    constructor(coll) {
        super(coll)
        this.nics = JSON.parse(JSON.stringify(coll))
    }
    get wrkColl() {return this.nics}
}

////////////////////
class CaseEntitlements extends Entitlements {
    static SQL = `
    SELECT 
        SUBSTR(nic_cases.Subject, 1, 16) AS subject, 
        nic_cases.ProvisionDate, 
        sfdcCase,operation AS oper,
        skuid,
        sku,
        qtty,
        price
    FROM nic_cases, nic_case_items
    WHERE nic_cases.inContactBUID=?
        AND nic_cases.CaseNumber=sfdcCase
    ORDER BY 
        ProvisionDate DESC,
        cast(skuid as INTEGER)
    `.replace(/\s+/g, " ")

    constructor(coll) {
        super(coll)   
        this.c2c = this.consColl
    }

    get wrkColl() {return this.c2c}

    get consColl() {
        return this.originalColl.reduce( (acc, obj) => {
            const findObj = acc.find(alreadyIn => alreadyIn.skuid === obj.skuid)
            if (findObj === undefined) {
                acc.push({skuid: obj.skuid, sku: obj.sku, price: obj.price, qtty: obj.qtty})
            } else {
                findObj.qtty += obj.qtty
            }
            return acc
        }, [])
    }
}


module.exports = {
    NgbsEntitlements: NgbsEntitlements,
    NiCEntitlements: NiCEntitlements,
    CaseEntitlements: CaseEntitlements
}