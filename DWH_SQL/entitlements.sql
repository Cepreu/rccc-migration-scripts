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
--?    LEFT JOIN stat.acct_statmetrics_mv00   mv00 ON mv00.userid = et.userid
--WHERE
--    st.name='Active' AND 
--    et.END_DATE > DATE '2020-12-01' AND 
--    et.start_date > DATE '2022-05-12'
ORDER BY
    et.userid;
