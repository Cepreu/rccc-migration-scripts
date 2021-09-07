const sql = `
SELECT 
	ProductSFDCID AS element_id,
	ProductName AS "Product Name", 
	ProductFamily AS "Product Family",
	ChargeTerm AS "Charge Term",
	MAX(ListPrice) AS Price,
	p1.CATALOG_PRICE as "Max Price",
	ProductCurrency as Curr,
	p1.TYPE_NAME as "Type",
	ProductType as "Product Type",
	Parent,
	CatID AS SKU,
	InContactName AS "NiC Name",
	inContactPrice AS "NiC Price",
	GOAGroupV2,
	p1.PACKAGE
	FROM OldCatalog_USA AS oc
	LEFT JOIN packages as p1 
		ON 
			oc.ProductName=p1.ITEM_NAME 
			AND (oc.CatID=p1.EXT_PRODUCT_ID OR oc.CatID IS NULL AND p1.EXT_PRODUCT_ID IS NULL)
			AND  (ProductFamily='Overage' AND p1.TYPE_NAME='Overage' OR ProductFamily!='Overage' AND p1.TYPE_NAME='Recurring')
			AND (ChargeTerm="Monthly - Contract" AND p1.CHARGE_TERM=1 OR ChargeTerm="Annual" AND p1.CHARGE_TERM=12)
	WHERE 
	   (
	   CatID IN (SELECT EXT_PRODUCT_ID FROM packages as p2 WHERE oc.CatID=p2.EXT_PRODUCT_ID OR oc.ProductName=p2.ITEM_NAME )
    OR 
		ProductName IN (SELECT ITEM_NAME FROM packages  AS p3 WHERE oc.CatID IS NULL AND EXT_PRODUCT_ID IS NULL AND oc.ProductName=p3.ITEM_NAME )
		)
    AND oc.CatID='309-11-171'
    GROUP BY ProductName, ProductFamily,ChargeTerm,Parent
	ORDER BY cast(CatID as number), ProductName
`
