import csv from 'csv-parser'
import stripBom from 'strip-bom-stream'
import fs from 'fs'

import {db} from './DBSingleton.mjs'

export const csv2sql = (table, fields, csv_file) => {
    const crtTblFlds = fields.map( x => x.dbcolumn + ' ' + x.type)
    const crtTblPKeys = fields.filter( x => x.pkey ).map( y => y.dbcolumn ).join(',')
    if (crtTblPKeys) crtTblFlds.push(`PRIMARY KEY(${crtTblPKeys})`)
    const crtTblRec = `CREATE TABLE IF NOT EXISTS ${table} (${crtTblFlds.join(',')})`

    db
        .prepare(crtTblRec)
        .run()

    const fldNames = fields.map( x => x.dbcolumn).join(',')
    const qtnMarks = fields.map( x => '?').join(',')
    const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (${fldNames}) VALUES (${qtnMarks})`)

    fs.createReadStream(csv_file)
        .pipe(stripBom())
        .pipe(csv({"separator": ","}))
        .on('data', row => {
            stmt.run(...fields.map(x => x.func(row[x.field])))
        })
        .on('end', () => {
            console.log(`${table} successfully processed`)
        })
}