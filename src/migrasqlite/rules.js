const ERROR = 'ERROR'
const WARNING = 'WARNING'
const INFO = 'INFO'

const OVERAGE = 'Overage'

class Rule {
    static portMap = {
        CCL_LRCCCA2SEATO_67: ['CCL_LAPRTAAE2O_405','CCL_LAPRTAAPEO_404'],
        CCL_LRCCCAPSEATO_26: ['CCL_LAPRTAAPEO_404'],
        CCL_LRCCCU2SEATO_73: ['CCL_LAPRTUESO_412','CCL_LAPRTUPESO_413'],
        CCL_LRCCCUCSEATO_61: ['CCL_LAPRTUPESO_413', 'CCL_LAPRTAUECO_406'],
        CCL_LRCCCUPSEATO_32: ['CCL_LAPRTUPESO_413']
    }
    
    static RCOTelecomLicenses = [
        { Category: "CCL_LASR_263",  ITEM_NAME: "Contact Center: Automated Speech Recognition (per minute)", USD: 0.08, CAD: 0.08 },
        { Category: "CCL_LICIBL_78", ITEM_NAME: "Inbound Local, per 10 min", USD: 0.00, CAD: 0 },
        { Category: "CCL_LICIBTF_79", ITEM_NAME: "Inbound Toll Free, per 10 min", USD: 0.18, CAD: 0.18 },
        { Category: "CCL_LICIBINT_81", ITEM_NAME: "Inbound International", USD: 0.01, CAD: 0.01 },
        { Category: "CCL_LICOBLC_83", ITEM_NAME: "Outbound Local Conversational, per 10 min", USD: 0.00, CAD: 0.00 },
        { Category: "CCL_LICOBIC_84", ITEM_NAME: "Outbound International Conversational", USD: 0.01, CAD: 0.01 },
        { Category: "CCL_LICOBDL_85", ITEM_NAME: "Outbound Dialer Local, per 10 min", USD: 0.21, CAD: 0.21 },
        { Category: "CCL_LICOBDINT_87", ITEM_NAME: "Outbound Dialer International", USD: 0.01, CAD: 0.01 },
        { Category: "CCL_LICOBLTF_88", ITEM_NAME: "Outbound local Toll Free", USD: 0.00, CAD: 0.00 }
    ]

    static Exceptions = [
        '1561-49-000',       // Service Package - CXsuccess Care Package
        '3157-18-204'        // Chat  and Email Channel - CXone Chat & Email (per Configured User)
    ]

    constructor({ name='', description='', action=null } = {}) {
        this.name = name
        this.description = description
        this.action = action
        this.logItems = new Array()
    }
    
    reset() {
        this.logItems.splice(0, this.logItems.length)
    }

    logger(severity, issue) {
        this.logItems.unshift({severity: severity, rule: this.name, issue: issue})
        if(severity === ERROR) console.log(severity, issue)
    }
}

const rules = []
const facts = {}

rules.push(new Rule ({
    name:  "RCCheckSeats",
    description: "Check seats",
    action:  function ({ents}) {
        facts.seat = ents.find(row => /^307-/.test(row.EXT_PRODUCT_ID) && row.ITEM_NAME==='Seat Overage')
        if (facts.seat === undefined) {
            this.logger( ERROR, "Seat license was not found or doesn't match MRC" )
            return false
        }
        if (!Rule.portMap.hasOwnProperty(facts.seat.Category)) {
            this.logger(ERROR, `Unknown seat license: ${facts.seat.Category}`)
            return false
        }
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixPorts",
    description: "Check/Fix Ports",
    action:  function ({ents, nics}) {   
        const nicPort = nics.find(nic => /^308-/.test(nic.SKU))  //Sub-rule #1
        if (nicPort !== undefined) {
            const entPorts = ents.filter(e => e.EXT_PRODUCT_ID === nicPort.SKU)
            if (entPorts.length === 0) {
                this.logger( ERROR, "RC PortOverage license was not found or doesn't match MRC" )
                return false
            } else {
                facts.entPortLic = entPorts[0]
                if (entPorts.length > 1) {
                    const p = entPorts.find(e => -1 < Rule.portMap[facts.seat.Category].findIndex(p => p === e.Category)) // Expected port by seat type
                    if (p!==undefined) facts.entPortLic = p; 
                }
            }
        } else { //Sub-rule #2
            // const casePort = cases.find(c => /^308-/.tect(c.skuid))
            const entPorts = ents.filter(row => /^308-/.test(row.EXT_PRODUCT_ID))
            if (entPorts.length === 0) {
                this.logger( ERROR, "RC PortOverage license was not found" )
                return false
            }
            facts.entPortLic = entPorts[0]
            if (entPorts.length > 1) {
                const p = entPorts.find(e => -1 < Rule.portMap[facts.seat.Category].findIndex(p => p === e.Category)) // Expected port by seat type
                if (p!==undefined) facts.entPortLic = p; 
            }
        }

        for( let i = 0; i < ents.length; i++) { // Cleanup of extra ports
            if (/^308-/.test(ents[i].EXT_PRODUCT_ID) && ents[i].Category !== facts.entPortLic.Category) {
                ents.splice(i--, 1)
            }
        }
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCExtraOverages",
    description: "Remove overage licenses without direct order",
    action:  function ({ents, nics, cases}) {
        for( let i = 0; i < ents.length; i++) {
            if (
                ents[i].ProductFamily === OVERAGE &&
                -1 === cases.findIndex(c => c.skuid === ents[i].EXT_PRODUCT_ID) && 
                -1 === nics.findIndex( n => n.SKU === ents[i].EXT_PRODUCT_ID)
            ) {
                this.logger(INFO, `Removed: ${ents[i].EXT_PRODUCT_ID} ${ents[i].ITEM_NAME}`)
                ents.splice(i--, 1)
            }
        }
        return true
    }
})
)

rules.push(new Rule ({
    name: "RCFixPrices2",
    description: "RC: fix Usage Licenses",
    action: function ({ents}) {
        const targetCats = [
            'CCL_LAOCRECNUO_436',
            'CCL_LSM1KIABO_470',
            'CCL_LSM2P5KIABO_471',
            'CCL_LSM5KIABO_472',
            'CCL_LSM10KIABO_473',
            'CCL_LSM25KIABO_474',
            'CCL_LSM50KIABO_475',
            'CCL_LSM100KIABO_476',
            'CCL_LWEMDAO_628',
            'CCL_LINTADIAPIO_658',
        ]
        targetCats.forEach(e => {
            const i = ents.findIndex(ent => e === ent.Category)
            if (i >= 0) {
                ents[i].DISCOUNT = 0.00
                this.logger(WARNING, `Catalog Price applied: ${ents[i].Category} (${ents[i].EXT_PRODUCT_ID}) ${ents[i].ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCProfServOnDemand",
    description: "Delete Professional Service Licenses",
    action: function ({ents}) {
        const toDeleteNames = [
            '610064-000-000',
            '610064-302-000',
        ]
        toDeleteNames.forEach(tdn => {
            const i = ents.findIndex(e => e.EXT_PRODUCT_ID === tdn)
            if (i >= 0) {
                this.logger(INFO, `Removed: ${ents[i].EXT_PRODUCT_ID} ${ents[i].ITEM_NAME}`)
                ents.splice(i, 1)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCOldTelco",
    description: "Delete old Telecom Licenses",
    action: function ({ents}) {
        const toDeleteNames = [
            'International Minutes Overage',
            'IVN Minutes Overage',
            'Domestic Minutes Overage'
        ]
        toDeleteNames.forEach(tdn => {
            const i = ents.findIndex(e => e.ITEM_NAME === tdn)
            if (i >= 0) {
                this.logger(INFO, `Removed: ${ents[i].EXT_PRODUCT_ID} ${ents[i].ITEM_NAME}`)
                ents.splice(i, 1)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCNewTelco",
    description: "Add Telephony Licenses",
    action:  function ({acct, ents}) {
        Rule.RCOTelecomLicenses.forEach(tl => {
            if (ents.find(e => e.Category === tl.Category) === undefined) {
                ents.push({
                    EXT_PRODUCT_ID: null,
                    Category: tl.Category,
                    ITEM_NAME: tl.ITEM_NAME,
                    QNTY_THRESHOLD: 0,
                    PRICE: acct.CURRENCY==='USD'? tl.USD: tl.CAD,
                    DISCOUNT: 0,
                    NiCPrice: 0,
                    CURRENCY: acct.CURRENCY,
                    ProductFamily: OVERAGE,
                    batchID: ""
                })
                this.logger(INFO, `Added: ${tl.Category} ${tl.ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixSocMedia",
    description: "Fix Social Media Overages",
    action:  function ({ents}) {
        for( let i = 0; i < ents.length; i++) {
            if (/^1502-/.test(ents[i].EXT_PRODUCT_ID) && ents[i].ProductFamily === OVERAGE) {
                this.logger( INFO, `Removed: ${ents[i].EXT_PRODUCT_ID} ${ents[i].ITEM_NAME}`)
                ents.splice(i--, 1)
            }
        }
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixNames",
    description: "RC: fix Names",
    action:  function ({ents}) {
        const targetSkus = ['4100-701-000', '1503-693-000', '1503-694-000', '4109-673-000', '500-617-000', '308-8-167', '3465-1227-000']
        ents.forEach(ent => {
            if (targetSkus.find(e => e === ent.EXT_PRODUCT_ID)) {
                this.logger( WARNING, `. : ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixPrices",
    description: "RC: fix Usage Licenses",
    action:  function ({ents}) {
        const targetSkus = ['4109-673-000', '3399-769-000']
        ents.forEach(ent => {
            if (targetSkus.find(e => e === ent.EXT_PRODUCT_ID) && ent.ProductFamily === OVERAGE) {
                ent.DISCOUNT = 0.00
                this.logger( WARNING, `Catalog Price applied: ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "NiC_MRCvsDWH",
    description: "Check if there are licenses in Monthly which are absent in RC entitlements.",
    action:  function ({ents, nics}) {
        let rule_res = true 
        nics.forEach(nl => {
            const entLic = ents.find(el => nl.SKU === el.EXT_PRODUCT_ID)
            if (entLic === undefined) {
                if (Rule.Exceptions.find(ex => nl.SKU === ex) !== undefined) {
                    this.logger( "INFO", `${nl.SKU} was found in NiC MRS file but not in RC entitlements. Ignored as an exception` )
                } else {
                    this.logger( ERROR, `${nl.SKU} was found in NiC MRS file but not in RC entitlements.` )
                    rule_res = false
                } 
            }
        })
        return rule_res
    }
})
)

rules.push(new Rule ({
    name:  "NiC_MRCvsC2C",
    description: "Check if there are licenses in Monthly which are absent in Cases - and add them",
    action:  function ({ents, nics, cases}) {
        let rule_res = true 
        nics.forEach(nl => {
            const caseLic = cases.find(cl => nl.SKU === cl.skuid)
            if (caseLic === undefined && Rule.Exceptions.find(ex => nl.SKU === ex) === undefined) {
                const entLic = ents.find(el => nl.SKU === el.EXT_PRODUCT_ID)
                if (entLic === undefined) {
                    this.logger( ERROR, `${nl.SKU} was not found in case2case but is presented in Monthly file. CANNOT BE RESTORED!` )
                    rule_res = false
                    return
                }
                if (nl.Quantity > 0) {
                    cases.push({
                            skuid: nl.SKU, 
                            sku: nl.Product,
                            qtty: entLic.QNTY_THRESHOLD,
                            price: nl.Amount / nl.Quantity
                        })
                        this.logger( WARNING, `${nl.SKU} was not found in case2case but is presented in Monthly file.`)
                } else {
                    cases.push({
                        skuid: nl.SKU, 
                        sku: nl.Product,
                        qtty: entLic.QNTY_THRESHOLD,
                        price: entLic.NiCPrice
                    })
                    this.logger( WARNING, `${nl.SKU} was not found in case2case but is presented in MRC. Price was added from the entitlement`)
                }
            }
        })
        return rule_res
    }
})
)

rules.push(new Rule ({
    name:  "NiCPorts",
    description: "Check/Fix NiC pors",
    action:  function ({cases}) {
    const casePortLic = cases.find(c => /^308-/.test(c.skuid))
    if (casePortLic === undefined) {
            this.logger( ERROR, "NiC PortOverage license was not found" )
            return false
        }
        if (casePortLic.skuid !== facts.entPortLic.EXT_PRODUCT_ID) {
            this.logger(WARNING, `inContact port ${casePortLic.skuid} replaced by ${facts.entPortLic.EXT_PRODUCT_ID} to match Entitlements`)
            casePortLic.skuid = facts.entPortLic.EXT_PRODUCT_ID
        }
        return true
    }
})
)

module.exports = {rules: rules, ERROR: ERROR, WARNING: WARNING, INFO: INFO}