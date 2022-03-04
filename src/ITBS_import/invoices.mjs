import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../configuration.mjs'

export const Invoices = () => {
    const fields = [
        {field: 'CCBID',                dbcolumn: 'CCBID',              type: 'TEXT',       pkey: false, func: x => x},	                          
        {field: 'USERID',               dbcolumn: 'USERID',             type: 'TEXT',       pkey: true,  func: x => x},	
        {field: 'INC_ACCOUNTID',        dbcolumn: 'INC_ACCOUNTID',      type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'BRANDID',              dbcolumn: 'BRANDID',            type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'BRANDNAME',            dbcolumn: 'BRANDNAME',          type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'SERVICELEVEL',         dbcolumn: 'SERVICELEVEL',       type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'ACCOUNTSTATUSID',      dbcolumn: 'ACCOUNTSTATUSID',    type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'BILLING_MONTH',        dbcolumn: 'BILLING_MONTH',      type: 'TEXT',       pkey: true,  func: x => x},	
        {field: 'BILLING_DATE',         dbcolumn: 'BILLING_DATE',       type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'CURRENCYID',           dbcolumn: 'CURRENCYID',         type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'TOTAL_AMOUNT',         dbcolumn: 'TOTAL_AMOUNT',       type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'ADMINID',              dbcolumn: 'ADMINID',            type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'TS_INSERTED',          dbcolumn: 'TS_INSERTED',        type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'TS_UPDATED',           dbcolumn: 'TS_UPDATED',         type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'PLAN_PAYMENTTYPEID',   dbcolumn: 'PLAN_PAYMENTTYPEID', type: 'TEXT',       pkey: false, func: x => x}
    ]
    csv2sql('Invoices', fields, configuration.DWH_INVOICES)
}


export const InvoiceLines = () => {
    const fields = [
        {field: 'CCBID',                dbcolumn: 'CCBID',              type: 'INTEGER',    pkey: false, func: x => x},	                          
        {field: 'USERID',               dbcolumn: 'USERID',             type: 'INTEGER',    pkey: true,  func: x => x},	
        {field: 'INC_ACCOUNTID',        dbcolumn: 'INC_ACCOUNTID',      type: 'INTEGER',    pkey: false, func: x => x},	
        {field: 'BRANDID',              dbcolumn: 'BRANDID',            type: 'INTEGER',    pkey: false, func: x => x},	
        {field: 'BRANDNAME',            dbcolumn: 'BRANDNAME',          type: 'TEXT',       pkey: false, func: x => x},		
        {field: 'BILLING_MONTH',        dbcolumn: 'BILLING_MONTH',      type: 'TEXT',       pkey: true,  func: x => x},	
        {field: 'BILLING_DATE',         dbcolumn: 'BILLING_DATE',       type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'TOTAL_AMOUNT',         dbcolumn: 'TOTAL_AMOUNT',       type: 'NUMBER',     pkey: false, func: x => x},	
        {field: 'EXT_PRODUCT_ID',       dbcolumn: 'EXT_PRODUCT_ID',     type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'NSBID',                dbcolumn: 'NSBID',              type: 'INTEGER',    pkey: false, func: x => x},	                        
        {field: 'BILLINGITEMID',        dbcolumn: 'BILLINGITEMID',      type: 'INTEGER',    pkey: false, func: x => x},	
        {field: 'CCBITEMID',            dbcolumn: 'CCBITEMID',          type: 'INTEGER',    pkey: false, func: x => x},	
        {field: 'ITEMNAME',             dbcolumn: 'ITEMNAME',           type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'ENTITLEMENT_LOG_ID',   dbcolumn: 'ENTITLEMENT_LOG_ID', type: 'INTEGER',    pkey: true,  func: x => x},	
        {field: 'ITEM_PRICE',           dbcolumn: 'ITEM_PRICE',         type: 'NUMBER',     pkey: false, func: x => x},	
        {field: 'QUANTITY',             dbcolumn: 'QUANTITY',           type: 'NUMBER',     pkey: false, func: x => x},	
        {field: 'ITEM_DISC',            dbcolumn: 'ITEM_DISC',          type: 'NUMBER',     pkey: false, func: x => x},	
        {field: 'AMOUNT',               dbcolumn: 'AMOUNT',             type: 'NUMBER',     pkey: false, func: x => x},	
        {field: 'TAX_TRANS_TYPE',       dbcolumn: 'TAX_TRANS_TYPE',     type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'TAX_SVC_TYPE',         dbcolumn: 'TAX_SVC_TYPE',       type: 'TEXT',       pkey: false, func: x => x},	
        {field: 'TAX_AMOUNT',           dbcolumn: 'TAX_AMOUNT',         type: 'NUMBER',     pkey: false, func: x => x},	
        {field: 'VSOE_PRICE',           dbcolumn: 'VSOE_PRICE',         type: 'NUMBER',     pkey: false, func: x => x}
    ]
    csv2sql('InvoiceLines', fields, configuration.DWH_INVOICE_LINES)
}
