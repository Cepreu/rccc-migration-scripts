import {csv2sql} from '../utils/csv2sql.mjs'
import configuration from '../../configuration.mjs'

export const RCMRCSummary = () => {
    const fields = [
	  {field: 'Account',	    dbcolumn: 'Account',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Customer',	    dbcolumn: 'Customer',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Address1',	    dbcolumn: 'Address1',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Address2',	    dbcolumn: 'Address2',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'City',	        dbcolumn: 'City',	      type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'State',	        dbcolumn: 'State',        type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'ZipCode',	    dbcolumn: 'ZipCode',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Invoice',	    dbcolumn: 'Invoice',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'BillingPeriodStart',	dbcolumn: 'BillingPeriodStart',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'BillingPeriodEnd',	dbcolumn: 'BillingPeriodEnd',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'InvoiceDate',	dbcolumn: 'InvoiceDate',  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'DueDate',	    dbcolumn: 'DueDate',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'ProductType',	dbcolumn: 'ProductType',  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'CatalogID',	    dbcolumn: 'CatalogID',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'FeatureID',	    dbcolumn: 'FeatureID',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'FeatureDetailID',	dbcolumn: 'FeatureDetailID',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Product',	    dbcolumn: 'Product',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Quantity',	    dbcolumn: 'Quantity',	  type: 'TEXT',	 pkey: false, func: x => x},
	  {field: 'Amount',     	dbcolumn: 'Amount', 	  type: 'TEXT',	 pkey: false, func: x => x}
    ]
    csv2sql('RCMRCSummary', fields, configuration.DWH_RCMRCSUMMARY, '|')
}
