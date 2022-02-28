import csv from 'csv-parser'
import stripBom from 'strip-bom-stream'
import fs from 'fs'

import configuration from '../configuration.js'
import Database from 'better-sqlite3'
const db = new Database(configuration.DATABASE, {fileMustExist: true, readonly: false, verbose: console.log})

export const csv2sql = (table, fields, csv_file) => {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS ${table} (
        ${fields.map( x => x.name + ' ' + x.type + (x.pkey? ' PRIMARY KEY': '')).join(',')})`
    ).run()

    const fldNames = fields.map( x => x.name).join(',')
    const qtnMarks = fields.map( x => '?').join(',')
    const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (${fldNames}) VALUES (${qtnMarks})`)

    fs.createReadStream(csv_file)
        .pipe(stripBom())
        .pipe(csv({"separator": ","}))
        .on('data', row => {
            stmt.run(...fields.map(x => x.func(row[x.name])))
        })
        .on('end', () => {
            console.log('EntitlememntLOG successfully processed')
            db.close()
        })
}