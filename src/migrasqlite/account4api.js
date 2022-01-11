// Incompleted. Real CatalogIDs are needed

const sql = `
SELECT '{ "account_meta": {' ||
    '"account_name": "' || AccountName ||
    '", "account_id": "' || BillingID ||
    '", "account_enterprise_id": "' || EnterpriseAccountID ||
    '", "catalog_package": "' || "BasicAdvancedTwoPorts" ||
    '", "account_owner_name": "' || AccountOwner ||
    '", "account_owner_email": "' || AccountOwner ||
	'" },'
FROM RAW_USA 
WHERE EnterpriseAccountID='62096204016'
UNION ALL	
 SELECT '"rc_licenses": ['
 UNION ALL
SELECT '{ ' || 
	'"catalog_id": "' || ifnull(EXT_PRODUCT_ID, "") || 
	'", "license_name": "' || ITEM_NAME || 
	'", "type": "' || TYPE_NAME || 
	'", "qtty": ' || QNTY_THRESHOLD || 
	',"cat_price": ' || RETAIL_PRICE || 
	', "discount":' || DISCOUNT_VALUE || 
	', "currency": "USD" },' 
FROM EntitlementLOG_USA 
WHERE USERID='62096204016'
UNION ALL
SELECT '{} ], "nic_licenses": ['
UNION ALL
SELECT '{ ' || 
	'"sku_id": "' || ifnull(skuid, "") || 
	'", "sku_name": "' || ifnull(sku,"") || 
	'", "type": "' || OPERATION || 
	'", "nic_qtty": ' || ifnull(qtty,0) || 
	',"nic_price": ' || price || 
	', "currency": "USD" },' 
FROM nic_case_items, nic_cases
WHERE 
     RingCentralUID='62096204016'
	 AND sfdcCase=CaseNumber
UNION ALL 
SELECT '{} ] }'
;`