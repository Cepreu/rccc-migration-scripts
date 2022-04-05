import path from 'path'
import date from 'date-and-time'
import configuration from '../../configuration.mjs'
import {csv2sql} from '../utils/csv2sql.mjs'

export const importCaseReport = () => {
    const fields = [
        {
            field: 'IC Case Number',  
            dbcolumn: 'ICCaseNumber',    
            type: 'INTEGER',    
            pkey: true
        },{
            field: 'inContact BU ID', 
            dbcolumn: 'inContactBUID',   
            type: 'INTEGER'
        },{
            field: 'Account (UID)',   
            dbcolumn: 'UID',             
            type: 'INTEGER'
        },{
            field: 'Account Name: Account Name', 
            dbcolumn: 'AccountName',   
            type: 'TEXT'
        },{
            field: 'Subject',
            dbcolumn: 'Subject',
            type: 'TEXT'
        },{
            field: 'Order Number',
            dbcolumn: 'OrderNumber',
            type: 'INTEGER'
        },
        {field: 'Order ID',         dbcolumn: 'OrderID',        type: 'TEXT'},
        {field: 'Case Number',      dbcolumn: 'CaseNumber',     type: 'INTEGER'},
        {field: 'Description',      dbcolumn: 'Description',    type: 'TEXT'},
        {field: 'Submitted Date',   dbcolumn: 'SubmittedDate',  type: 'TEXT'},
        {
            field: 'Provision Date',   
            dbcolumn: 'ProvisionDate', 
            type: 'TEXT',    
            func: x => date.transform(x, 'M/D/YYYY', 'YYYY-MM-DD')
        },
        {field: 'Order Type',       dbcolumn: 'OrderType',      type: 'TEXT'},
        {field: 'Status',           dbcolumn: 'Status',         type: 'TEXT'},
        {
            field: 'Opportunity: Opportunity Name',
            dbcolumn: 'OpportunityName',
            type: 'TEXT'
        },{
            field: 'Brand',
            dbcolumn: 'Brand',         
            type: 'TEXT'
        },{              
            field: 'No. of InContact Seats',    
            dbcolumn: 'NoOfInContactSeats',     
            type: 'INTEGER'
        },{
            field: 'Implementation Team',    
            dbcolumn: 'ImplementationTeam',     
            type: 'TEXT'
        },{
            field: 'Contact Center Number',    
            dbcolumn: 'ContactCenterNumber',     
            type: 'TEXT'
        },{
            field: 'Geo Region',    
            dbcolumn: 'GeoRegion',     
            type: 'TEXT'
        },{
            field: 'Default Time Zone',    
            dbcolumn: 'DefaultTimeZone',     
            type: 'TEXT'
         },{
            field: 'Created Date',    
            dbcolumn: 'CreatedDate',     
            type: 'TEXT',       
            func: x => date.transform(x, 'M/D/YYYY', 'YYYY-MM-DD')
        },{
            dbcolumn: 'DBInserted',    
            type: 'TEXT', 
            rowfunc: () => date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
        }
    ]
    const guardFunc = row => row["IC Case Number"] !== ''
    csv2sql('nic_cases', fields, configuration.C2CPATH, ',', guardFunc)
}
