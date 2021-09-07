const path = require('path')
const parse = require('csv-parse')
const fs = require('fs')
const { finished } = require('stream/promises')
const cliProgress = require('cli-progress')
const {packetizer} = require('./packetizer')
const {isSeatEdition} = require('./rules')

const progressBar = new cliProgress.SingleBar({}, cliProgress.shades_classic)

const order = {CustomerID: null, entitlements: []}

const avgLineLen = 86

exports.getOrdersFromCSV = async (filename, handleResultFunc) => {
    const file = path.resolve(process.cwd(), 'data', filename)
    const progressLines = Math.round(fs.statSync(file).size / avgLineLen)
    const progressStep = Math.round(progressLines / 40)
    progressBar.start(progressLines, 0)

    const packages = []
    numHandled = 0
    const parser = fs  
        .createReadStream(file)
        .pipe( parse({
            columns: true,
            trim: true
        }))

    parser.on('readable', () => {
        let data
        while ( data = parser.read() ) {
            const e = {
                skuId: data.EXT_PRODUCT_ID, 
                name: data.ITEM_NAME,
                type: data.TYPE_NAME,
                price: parseFloat(data.MaxPrice)
            }
            if (order.CustomerID === data.USERID) {
                if (isSeatEdition(e.name)) {
                    order.entitlements.unshift(e) // make it first
                } else {
                    order.entitlements.push(e)
                }
            } else {
                if (order.CustomerID) packetizer(order, packages)
                order.CustomerID = data.USERID
                order.entitlements = [e]
            }

            numHandled++
            if (numHandled % progressStep == 0) { progressBar.update(numHandled) }
        }
    })

    await finished(parser)
    packetizer(order, packages); // last order
    progressBar.stop()
    handleResultFunc(packages)
}

