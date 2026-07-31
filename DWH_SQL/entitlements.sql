SELECT
    et.userid,
    to_char(et.entitlement_log_id)               AS id,
    to_char(et.start_date, 'yyyy-mm-dd hh24:mi') AS start_date,
    CASE
        WHEN et.end_date = DATE '9999-12-31' THEN
            ''
        ELSE
            to_char(et.end_date, 'yyyy-mm-dd hh24:mi')
    END                                          AS end_date,
    to_char(bit.countryid)                       AS country_id,
    cc.name                                      AS country_name,
    to_char(et.billingitemid)                    AS billing_item_id,
    et.ext_product_id                            AS ext_product_id,
    bit.itemname                                 AS item_name,
    to_char(et.retail_price)                     AS retail_price,
    to_char(et.discount_value)                   AS discount_value,
    et.discount_type_name                        AS discount_type,
    to_char(et.qnty_threshold)                   AS qnty_threshold,
    tt.name                                      AS productfamily,
    st.name                                      AS status_name,
    et.mduration,
    cur.currency_code,
    to_char(etx.prod_det_rampup_start, 'yyyy-mm-dd hh24:mi') AS rampup_start,
    to_char(etx.prod_det_rampup_end, 'yyyy-mm-dd hh24:mi') AS rampup_end
FROM
    stat.vueh_ccenter_entitl_log     et
    LEFT JOIN stat.vueh_ccenter_entitl_log_ext etx ON et.entitlement_log_id = etx.entitlement_log_id
    LEFT JOIN stat.dwl_billingitems            bit ON bit.billingitemid = et.billingitemid
    LEFT JOIN stat.ueh_detail_statuses         st ON st.detailstatusid = et.detailstatusid
    LEFT JOIN stat.ueh_detail_types            tt ON tt.detailtypeid = et.detailtypeid
    LEFT JOIN stat.swr_countrycode             cc ON cc.countryid = bit.countryid
    LEFT JOIN stat.swr_currencies              cur ON cur.id_currency = etx.currencyid

--WHERE
--    et.userid IN (2853975064,2854245064,2854247064,2855629064,2859151064,2859201064,2859212064,3231659064,1996741064,533053067,798580065,2635954064,3365278064,3023774064,2447156064,709779065,2907463064,658987067,590849067,2006642064,640473065,2346610064,721618065,3282263064,550547067,2939768064,3488139064,263219067,665157065,1609151064,687487067,2265422064,244092066,722377067,2339612064,199113051,1442231024,148776050,367204050,146502050,198427051,171004051,174691051,1066127024,1323521024,157033051,678823024,1139816024,367344051,336260051,1487607024,595090051,1207949024,1475054024,1407328024,1107606024,378689051,424275051,218958050,439009051,1274731024,285700051,179031051,1238872024)
ORDER BY
    et.userid;
