import Database from 'better-sqlite3'
import configuration from '../../configuration.mjs'

const db = new Database(configuration.DB_DATAFILE, {fileMustExist: false, readonly: false, verbose: configuration.DB_VERBOSE}) 

export {db}