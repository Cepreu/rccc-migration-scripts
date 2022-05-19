SELECT
    u.userid,
    a.acct_brandid,
    a08.accountid billing_id,
    b.brandname,
    i.ext_account_id,
    c.id_currency,
    c.currency_code,
    CASE
        WHEN a.acct_paysystemid = 0 THEN
            bp.mduration
        ELSE
            abt.mduration
    END           mduration,
    tr.contract_term
FROM
    (
        SELECT DISTINCT
            e.userid
        FROM
            stat.vueh_ccenter_entitl_log e
        WHERE
                e.start_date < TO_DATE('30/04/2022', 'dd/mm/yyyy')
            AND ( e.detailstatusid = 2
                  AND ( ( e.detailtypeid != 6
                          AND e.end_date >= TO_DATE('30/04/2022', 'dd/mm/yyyy') )
                        OR ( e.detailtypeid = 6
                             AND e.start_date = e.end_date
                             AND e.start_date >= TO_DATE('01/04/2022', 'dd/mm/yyyy') ) )
                  OR ( e.detailstatusid = 4
                       AND e.start_date >= TO_DATE('01/04/2022', 'dd/mm/yyyy') ) )
    )                                 u
    LEFT JOIN stat.acct_statmetrics_mv00        a ON u.userid = a.userid
    LEFT JOIN stat.acct_statmetrics_mv08        a08 ON u.userid = a08.userid
    LEFT JOIN stat.swr_brands                   b ON a.acct_brandid = b.brandid
    LEFT JOIN stat.swr_currencies               c ON c.id_currency = b.id_currency
    LEFT JOIN (
        SELECT
            r.*
        FROM
            (
                SELECT
                    userid,
                    effective_date_utc,
                    ext_account_id,
                    ROW_NUMBER()
                    OVER(PARTITION BY userid
                         ORDER BY
                             effective_date_utc DESC
                    ) row_num
                FROM
                    stat.acct_ext_accounts_mapping
            ) r
        WHERE
            r.row_num = 1
    )                                 i ON i.userid = a.userid
    LEFT JOIN (
        SELECT
            t.userid,
            MAX(t.mduration) KEEP(DENSE_RANK LAST ORDER BY t.event_date, t.userlogid) mduration
        FROM
            stat.abt_acctlog t
        GROUP BY
            t.userid
    )                                 abt ON abt.userid = a.userid
    LEFT JOIN (
        SELECT
            vex.service_account_id,
            ( MAX(vex.master_duration) KEEP(DENSE_RANK LAST ORDER BY vex.log_event_date) ) mduration
        FROM
            stat.vnbs_package_attributes_log vex
        GROUP BY
            vex.service_account_id
    )                                 bp ON bp.service_account_id = a.userid
    LEFT JOIN stat.vcdm_periods_reporting_track tr ON tr.userid = a.userid
                                                      AND trunc(us_pacific_sysdate) BETWEEN tr.period_first_day AND tr.period_last_day
ORDER BY
    userid