import fs from 'fs'

import {db} from '../utils/DBSingleton.mjs'

import {parseDescription, test1} from './DescriptionParser.mjs'

test1()

//////////////////////
// caseItems
//////////////////////
export function caseItems(outfile, timestamp) {
    const sqler = fs.createWriteStream(outfile, {
        flags: 'w' //overwrite old content, if any
    })

    const stmt = db.prepare(
        `SELECT 
            CaseNumber AS case_id,
            UID AS acc_id, 
            inContactBUID AS bu_id, 
            Description AS descr 
        FROM nic_cases 
        WHERE descr IS NOT NULL
${timestamp !== undefined? "AND DBInserted='" + timestamp + "'": ''}`
    .replace(/\s+/g, " "))
    
    let i = 0
    for (const row of stmt.iterate()) {
        const res = {}
        parseDescription(row.descr, row.case_id, row.acc_id, row.bu_id, res)
        if (res.hasOwnProperty("cases")) {
            sqler.write(`-- #${++i}\n`)
            sqler.write(res.cases)
        }
        if (res.hasOwnProperty("notes")) {
            sqler.write(`-- #${++i}\n`)
            sqler.write(res.notes)
        }
    }
}