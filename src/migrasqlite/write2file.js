const path = require('path')
const fs1 = require('fs-extra')
const excel = require('excel4node')
const {OUTPUTPATH} = require('../configuration')

const getDir = pathArr => {
    const dir = path.resolve(OUTPUTPATH? OUTPUTPATH: process.cwd(), ...pathArr)
    fs1.ensureDirSync(dir)
    fs1.emptyDirSync(dir)
    return dir
}

exports.write2json = (account, entitlements, nics, pathArr) => {
    const dir = getDir(pathArr)
    fs1.writeFile(path.resolve(dir, "account.json"), JSON.stringify(account, null, '\t'))
    fs1.writeFile(path.resolve(dir, "entitlements.json"), JSON.stringify(entitlements, null, '\t'))
    fs1.writeFile(path.resolve(dir, "nic_entitlements.json"), JSON.stringify(nics, null, '\t'))
}

exports.write2excel = (tabsArr, pathArr, fileName) => {
    const dir = getDir(pathArr)
    const workbook = new excel.Workbook();

    const styleForHeaders = workbook.createStyle({
        font: {
            color: '#EA3A14',
        //    size: 12,
            bold: true
        }
    })

    const styleForData = workbook.createStyle({
        font: {
            color: '#47180E'
        },
        alignment: {
            wrapText: false,
            horizontal: 'left',
        }
    })

    for (tab of tabsArr) {
        const t = workbook.addWorksheet(tab["tab"])
        const array = tab["data"]
        if (array.length > 0) {
            const columns = tab.hasOwnProperty('columns')? tab.columns: Object.keys(array[0])
            generateExcelSheet(array, columns, t, styleForHeaders, styleForData)
        }
    }

    workbook.write(path.resolve(dir, `${fileName}.xlsx`))
}

const generateExcelSheet = (array, columns, worksheet, style, styleForData) => {
    let excl_col = 1
    columns.forEach(element => {
        const lengthArr = array.map(row => row[element]===null? 0: row[element].toString().length)
        const maxWidth = Math.max(...lengthArr)
        worksheet.column(excl_col).setWidth(maxWidth + 2)

        worksheet.cell(1, excl_col++).string(element).style(style);
    }); 

    let excl_row = 2         //Row starts from 2 as 1st row is for headers.
    array.forEach(data_row => {
    let excl_col = 1
    columns.forEach(c => {
        const element = data_row[c]
        switch (typeof(element)) {
            case 'string':
                worksheet.cell(excl_row, excl_col++).string(element).style(styleForData)
                break
                case 'number':     
                worksheet.cell(excl_row, excl_col++).number(element).style(styleForData)
                break
            case 'boolean':     
                worksheet.cell(excl_row, excl_col++).string(element?'true':'false').style(styleForData)
                break
            default:
                worksheet.cell(excl_row, excl_col++).string("").style(styleForData)
                break
            }
    }) 
    excl_row++
    })
}