import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../configuration.js'

export const EntitlementsLOG = () => {
    const fields = [
        {name: 'USERID',            type: 'INTEGER',    pkey: false, func: x => x},
        {name: 'ID',                type: 'INTEGER',    pkey: true,  func: x => x},
        {name: 'START_DATE',        type: 'TEXT',       pkey: false, func: x => x},
        {name: 'END_DATE',          type: 'TEXT',       pkey: false, func: x => x},
        {name: 'COUNTRY_ID',        type: 'INTEGER',    pkey: false, func: x => x},
        {name: 'COUNTRY_NAME',      type: 'TEXT',       pkey: false, func: x => x},
        {name: 'BILLING_ITEM_ID',   type: 'INTEGER',    pkey: false, func: x => x},
        {name: 'EXT_PRODUCT_ID',    type: 'TEXT',       pkey: false, func: x => x},
        {name: 'ITEM_NAME',         type: 'TEXT',       pkey: false, func: x => x},
        {name: 'RETAIL_PRICE',	    type: 'NUMERIC',    pkey: false, func: x => x.replace(',', '.')},
        {name: 'DISCOUNT_VALUE',	type: 'NUMERIC',    pkey: false, func: x => x.replace(',', '.')},
        {name: 'QNTY_THRESHOLD',    type: 'INTEGER',    pkey: false, func: x => x},
        {name: 'TYPE_NAME',         type: 'TEXT',       pkey: false, func: x => x},
        {name: 'STATUS_NAME',       type: 'TEXT',       pkey: false, func: x => x}
    ]
    csv2sql('EntitlementLOG', fields, configuration.DWH_ENTITLEMENTS)
}
