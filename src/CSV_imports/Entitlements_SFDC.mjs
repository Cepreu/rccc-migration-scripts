import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../../configuration.mjs'

export const EntitlementsLOG = () => {
    const fields = [
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
        {field: 'Price',                        dbcolumn: "Price",      type: 'NUMERIC'},
        {field: 'Discount',                     dbcolumn: "Discount",      type: 'NUMERIC'},
        {field: 'Quantity',                     dbcolumn: "Quantity",      type: 'NUMERIC'},
        {field: 'Product: inContact Price',     dbcolumn: "inContactPrice",      type: 'NUMERIC'},
        {field: 'Product: Charge Term',         dbcolumn: "ChargeTerm",        type: 'TEXT'},
        {field: 'Invoice Terms',                dbcolumn: "InvoiceTerms",        type: 'TEXT'},
        {field: 'Product: inContact Price Currency', dbcolumn: "inContactPriceCurrency",        type: 'TEXT'},
        {field: 'Quantity Or Threshold',        dbcolumn: "QuantityOrThreshold",      type: 'NUMERIC'},
        {field: 'Product: Billing Type',        dbcolumn: "BillingType",        type: 'TEXT'}
        ]
        csv2sql('Entitlements_SFDC', fields, configuration.DWH_ENTITLEMENTS)
    }