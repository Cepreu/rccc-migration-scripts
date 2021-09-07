const path = require('path')
const parse = require('csv-parse')
const fs = require('fs')
const fs1 = require('fs').promises
const { finished } = require('stream/promises')

const cliProgress = require('cli-progress')
const progressBar = new cliProgress.SingleBar({}, cliProgress.shades_classic)
const avgLineLen = 86

const customer = {CustomerID: null, entitlements: []}

exports.processFile = async (filename, handleCustomerFunc) => {
    const file = path.resolve(process.cwd(), 'data', filename)

    const progressLines = Math.round(fs.statSync(file).size / avgLineLen)
    const progressStep = Math.round(progressLines / 40)
    progressBar.start(progressLines, 0)
    numHandled = 0

    const parser = fs
    .createReadStream(file)
    .pipe(parse({
        columns: true,
        trim: true
    }));
    parser.on('readable', () => {
        let record;
        while (record = parser.read()) {
            if (customer.CustomerID === record.ACCOUNT_ID) {
                customer.entitlements.push(record)
            } else {
                if (customer.CustomerID) handleCustomerFunc(customer)
                customer.CustomerID = record.ACCOUNT_ID
                customer.entitlements = [record]
            }

            numHandled++
            if (numHandled % progressStep == 0) { progressBar.update(numHandled) }
        }
    });
    await finished(parser)
    handleCustomerFunc(customer) // last customer
}

exports.write2file = async (customer) => {
    await fs1.writeFile(path.resolve(process.cwd(), 'results', 'batch01', "" + customer.CustomerID), JSON.stringify(customer, null, '\t'))
}
