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
    to_char(et.qnty_threshold)                   AS qnty_threshold,
    tt.name                                      AS type_name,
    st.name                                      AS status_name,
    et.mduration
FROM
    stat.vueh_ccenter_entitl_log et
    LEFT JOIN stat.dwl_billingitems        bit ON bit.billingitemid = et.billingitemid
    LEFT JOIN stat.ueh_detail_statuses     st ON st.detailstatusid = et.detailstatusid
    LEFT JOIN stat.ueh_detail_types        tt ON tt.detailtypeid = et.detailtypeid
    LEFT JOIN stat.swr_countrycode         cc ON cc.countryid = bit.countryid
    LEFT JOIN stat.acct_statmetrics_mv00   mv00 ON mv00.userid = et.userid
WHERE
        mv00.acct_brandid = 1210
    AND mv00.acct_statusid = 7
ORDER BY
    et.userid;    