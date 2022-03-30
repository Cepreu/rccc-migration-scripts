import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../../configuration.mjs'

export const EntitlementsLOG = () => {
    const fields = [
        {field: 'USERID',          dbcolumn: 'USERID',            type: 'INTEGER',    pkey: false, func: x => x},
        {field: 'ID',              dbcolumn: 'ID',                type: 'INTEGER',    pkey: true,  func: x => x},
        {field: 'START_DATE',      dbcolumn: 'START_DATE',        type: 'TEXT',       pkey: false, func: x => x},
        {field: 'END_DATE',        dbcolumn: 'END_DATE',          type: 'TEXT',       pkey: false, func: x => x},
        {field: 'COUNTRY_ID',      dbcolumn: 'COUNTRY_ID',        type: 'INTEGER',    pkey: false, func: x => x},
        {field: 'COUNTRY_NAME',    dbcolumn: 'COUNTRY_NAME',      type: 'TEXT',       pkey: false, func: x => x},
        {field: 'BILLING_ITEM_ID', dbcolumn: 'BILLING_ITEM_ID',   type: 'INTEGER',    pkey: false, func: x => x},
        {field: 'EXT_PRODUCT_ID',  dbcolumn: 'EXT_PRODUCT_ID',    type: 'TEXT',       pkey: false, func: x => x},
        {field: 'ITEM_NAME',       dbcolumn: 'ITEM_NAME',         type: 'TEXT',       pkey: false, func: x => x},
        {field: 'RETAIL_PRICE',    dbcolumn: 'RETAIL_PRICE',      type: 'NUMERIC',    pkey: false, func: x => x.replace(',', '.')},
        {field: 'DISCOUNT_VALUE',  dbcolumn: 'DISCOUNT_VALUE',    type: 'NUMERIC',    pkey: false, func: x => x.replace(',', '.')},
        {field: 'QNTY_THRESHOLD',  dbcolumn: 'QNTY_THRESHOLD',    type: 'INTEGER',    pkey: false, func: x => x},
        {field: 'TYPE_NAME',       dbcolumn: 'TYPE_NAME',         type: 'TEXT',       pkey: false, func: x => x},
        {field: 'STATUS_NAME',     dbcolumn: 'STATUS_NAME',       type: 'TEXT',       pkey: false, func: x => x}
    ]
    csv2sql('EntitlementLOG', fields, configuration.DWH_ENTITLEMENTS)
}
