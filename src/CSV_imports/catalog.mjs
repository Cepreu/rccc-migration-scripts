import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../../configuration.mjs'

export const Catalog = () => {
    const fields = [
        {                          dbcolumn: 'FEATURE_ID',        type: 'TEXT',       pkey: true,  rowfunc: row => ['CCL',row['L Category'],row['Number']].join('_') },
        {field: 'Licenses',        dbcolumn: 'LICENSE',           type: 'TEXT',       pkey: true},
        {field: 'License Type',    dbcolumn: 'LISENSE_TYPE',      type: 'TEXT'},
        {field: 'Tax category_USD',dbcolumn: 'TAX_CATEGORY',      type: 'TEXT'},
        {field: 'Named (USD)',     dbcolumn: 'PRICE_USD',         type: 'NUMERIC',    pkey: false, func: x => Number(x.replace(/[^0-9.-]+/g,"")) },
        {field: 'Named (CAD)',     dbcolumn: 'PRICE_CAD',         type: 'NUMERIC',    pkey: false, func: x => Number(x.replace(/[^0-9.-]+/g,"")) },
        {field: 'Parent',          dbcolumn: 'PARENT_FEATURE_ID', type: 'TEXT'}
    ]
    const guardFunc = row => row["L Category"] !== ''
    csv2sql( 'Catalog', fields, configuration.NGBS_CATALOG, ',', guardFunc )
}
