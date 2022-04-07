import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../../configuration.mjs'

export const EntitlementsLOG = () => {
    const fields = [
        {field: 'USERID',          dbcolumn: 'USERID',            type: 'INTEGER'},
        {field: 'ID',              dbcolumn: 'ID',                type: 'INTEGER',    pkey: true,  func: x => x},
        {field: 'START_DATE',      dbcolumn: 'START_DATE',        type: 'TEXT'},
        {field: 'END_DATE',        dbcolumn: 'END_DATE',          type: 'TEXT'},
        {field: 'COUNTRY_ID',      dbcolumn: 'COUNTRY_ID',        type: 'INTEGER'},
        {field: 'COUNTRY_NAME',    dbcolumn: 'COUNTRY_NAME',      type: 'TEXT'},
        {field: 'BILLING_ITEM_ID', dbcolumn: 'BILLING_ITEM_ID',   type: 'INTEGER'},
        {field: 'EXT_PRODUCT_ID',  dbcolumn: 'EXT_PRODUCT_ID',    type: 'TEXT'},
        {field: 'ITEM_NAME',       dbcolumn: 'ITEM_NAME',         type: 'TEXT'},
        {field: 'RETAIL_PRICE',    dbcolumn: 'RETAIL_PRICE',      type: 'NUMERIC',.replace(',', '.')},
        {field: 'DISCOUNT_VALUE',  dbcolumn: 'DISCOUNT_VALUE',    type: 'NUMERIC'.replace(',', '.')},
        {field: 'QNTY_THRESHOLD',  dbcolumn: 'QNTY_THRESHOLD',    type: 'INTEGER'},
        {field: 'TYPE_NAME',       dbcolumn: 'TYPE_NAME',         type: 'TEXT'},
        {field: 'STATUS_NAME',     dbcolumn: 'STATUS_NAME',       type: 'TEXT'}

        {field: 'Brand',                        dbcolumn: "Brand",                  type: 'TEXT'},
        {field: 'Product: CatID',               dbcolumn: "CatID",                  type: 'TEXT'},
        {field: 'Enterprise Account ID',        dbcolumn: "EnterpriseAccountID",    type: 'TEXT'},
        {field: 'InContact BU ID',              dbcolumn: "InContactBUID",          type: 'TEXT'},
        {field: 'Account Name',                 dbcolumn: "AccountName",            type: 'TEXT'},
        {field: 'Product: InContact Name',      dbcolumn: "InContactName",          type: 'TEXT'},
        {field: 'RC Entitlement: Entitlement Name', dbcolumn: "EntitlementName",    type: 'TEXT'},
        {field: 'Product: Product Family',      dbcolumn: "ProductFamily",        type: 'TEXT'},
        {field: 'Implementation Complete Date', dbcolumn: "ImplementationCompleteDate",        type: 'TEXT'},
        {field: 'RC Entitlement: Currency',     dbcolumn: "Currency",        type: 'TEXT'},
        {field: 'Price',                        dbcolumn: "Price",      type: 'NUMERIC',
        {field: 'Discount',                     dbcolumn: "Discount",      type: 'NUMERIC',
        {field: 'Quantity',                     dbcolumn: "Quantity",      type: 'NUMERIC',
        {field: 'Product: inContact Price',     dbcolumn: "inContactPrice",      type: 'NUMERIC',
        {field: 'Product: Charge Term',         dbcolumn: "ChargeTerm",        type: 'TEXT'},
        {field: 'Invoice Terms',                dbcolumn: "InvoiceTerms",        type: 'TEXT'},
        {field: 'Product: inContact Price Currency', dbcolumn: "inContactPriceCurrency",        type: 'TEXT'},
        {field: 'Quantity Or Threshold',        dbcolumn: "QuantityOrThreshold",      type: 'NUMERIC',
        {field: 'Product: Billing Type',        dbcolumn: "BillingType",        type: 'TEXT'}
        ]
        csv2sql('Entitlements_SFDC', fields, configuration.DWH_ENTITLEMENTS)
    }
    "","","","","",
    "","","","","",
    "","","","","",
    "","","",""
