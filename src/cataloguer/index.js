const {getOrdersFromCSV} = require('./readOrdersFromFile')
const {prepareCatalogs} = require('./readOrdersFromDB')
const {handleResult} = require('./packetizer')

exports.build_packages = () => {
    (async () => {
    const inFile = 'ENT_USA_RO2.csv'
    await getOrdersFromCSV(inFile, handleResult)
    })()
}
exports.build_packages_SQL = () => {
    prepareCatalogs(handleResult)
}