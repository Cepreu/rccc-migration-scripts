const { processFile, write2file } = require('./readEntitlementsFromFile')

exports.build_feeds = () => {
    (async () => {
        await processFile("RC_Entitlements_Batch01.csv", write2file)
    })()
}
