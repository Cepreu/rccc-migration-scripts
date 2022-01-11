class Rule {
    static portMap = {
        LRCCCA2SEATO: ['LAPRTAAE2O','LAPRTAAPEO'],
        LRCCCAPSEATO: ['LAPRTAAPEO'],
        LRCCCU2SEATO: ['LAPRTUESO','LAPRTUPESO'],
        LRCCCUCSEATO: ['LAPRTUPESO', 'LAPRTAUECO'],
        LRCCCUPSEATO: ['LAPRTUPESO']
    }

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
        this.logItems.push({severity: severity, rule: this.name, issue: issue})
        console.log(severity, issue)
    }
}


const facts = {}
const rules = []

/////
rules.push(new Rule ({
    name: "RCFixPrices2",
    description: "RC: fix Usage Licenses",
    action: function (ents) {
        const targetCats = [
            'SM50KIABO',
            'SM100KIABO',
            'SM25KIABO',
            'SM1KIABO',
            'SM2P5KIABO',
            'SM5KIABO',
            'SM10KIABO',
            'INTADIAPIO',
            'WEMDAO',
            'AOCRECNUO'
        ]
        targetCats.forEach(e => {
            const i = ents.findIndex(ent => e === ent.Category)
            if (i >= 0) {
                ents[i].DISCOUNT = 0.00
                this.logger(`Warning`, `Catalog Price applied: ${ents[i].Category} (${ents[i].EXT_PRODUCT_ID}) ${ents[i].ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCOldTelco",
    description: "Delete old Telecom Licenses",
    action: function (ents) {
        const toDeleteNames = [
            'International Minutes Overage',
            'IVN Minutes Overage',
            'Domestic Minutes Overage'
        ]
        toDeleteNames.forEach(tdn => {
            const i = ents.findIndex(e => e.ITEM_NAME === tdn)
            if (i >= 0) {
                this.logger(`INFO`, `Removed: ${ents[i].EXT_PRODUCT_ID} ${ents[i].ITEM_NAME}`)
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
    action:  function (ents) {
        const addLicenses = [
            { Category: "LICIBINT", ITEM_NAME: "Inbound International", PRICE: 0.01 },
            { Category: "LICIBL", ITEM_NAME: "Inbound Local, per 10 min", PRICE: 0 },
            { Category: "LICIBTF", ITEM_NAME: "Inbound Toll Free, per 10 min", PRICE: 0.18 },
            { Category: "LICOBDINT", ITEM_NAME: "Outbound Dialer International", PRICE: 0.01 },
            { Category: "LICOBDL", ITEM_NAME: "Outbound Dialer Local, per 10 min", PRICE: 0.21 },
            { Category: "LICOBIC", ITEM_NAME: "Outbound International Conversational", PRICE: 0.01 },
            { Category: "LICOBLC", ITEM_NAME: "Outbound Local Conversational, per 10 min", PRICE: 0 },
            { Category: "LICOBLTF", ITEM_NAME: "Outbound local Toll Free", PRICE: 0 }
        ]

        addLicenses.forEach(tl => {
            ents.push({
                EXT_PRODUCT_ID: null,
                Category: tl.Category,
                ITEM_NAME: tl.ITEM_NAME,
                QNTY_THRESHOLD: 0,
                PRICE: tl.PRICE,
                DISCOUNT: 0,
                NiCPrice: 0,
                CAT_PRICE: tl.PRICE,
                ProductFamily: null,
                batchID: ""
            })
            this.logger(`INFO`, `Added: ${tl.Category} ${tl.ITEM_NAME}`)
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCCheckSeats",
    description: "Check seats",
    action:  function (ents) {
        facts.seat = ents.find(row => /^307-/.test(row.EXT_PRODUCT_ID) && row.ITEM_NAME==='Seat Overage')
        if (facts.seat === undefined) {
            this.logger( "ERROR", "Seat license is not found" )
            return false
        }
        if (!Rule.portMap.hasOwnProperty(facts.seat.Category)) {
            this.logger( `ERROR`, `Unknown seat license: ${facts.seat.Category}`)
            return false
        }
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixPorts",
    description: "Check/Fix Ports",
    action:  function (ents) {
        const entPorts = ents.filter(row => /^308-/.test(row.EXT_PRODUCT_ID))
        if (entPorts.length === 0) {
            this.logger( "ERROR", "RC PortOverage license was not found" )
            return false
        }   
        facts.entPortLic = entPorts[0]
        if (entPorts.length > 1) {
            const p = entPorts.find(e => -1 < Rule.portMap[facts.seat.Category].findIndex(p => p===e.Category)) // Expected port by seat type
            if (p!==undefined) facts.entPortLic = p; 
        }
        for( let i = 0; i < ents.length; i++) {
            if (/^308-/.test(ents[i].EXT_PRODUCT_ID) && ents[i].Category !== facts.entPortLic.Category) {
                ents.splice(i--, 1)
            }
        }
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixSocMedia",
    description: "Fix Social Media Overages",
    action:  function (ents) {
        for( let i = 0; i < ents.length; i++) {
            if (/^1502-/.test(ents[i].EXT_PRODUCT_ID) && ents[i].ProductFamily === 'Overage') {
                this.logger( `INFO`, `Removed: ${ents[i].EXT_PRODUCT_ID} ${ents[i].ITEM_NAME}`)
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
    action:  function (ents) {
        const targetSkus = ['4100-701-000', '1503-693-000', '1503-694-000', '4109-673-000', '500-617-000', '308-8-167', '3465-1227-000']
        ents.forEach(ent => {
            if (targetSkus.find(e => e === ent.EXT_PRODUCT_ID)) {
                this.logger( `Warning`, `Renamed as in the catalog: ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "RCFixPrices",
    description: "RC: fix Usage Licenses",
    action:  function (ents) {
        const targetSkus = ['4109-673-000', '3399-769-000']
        ents.forEach(ent => {
            if (targetSkus.find(e => e === ent.EXT_PRODUCT_ID) && ent.ProductFamily === 'Overage') {
                ent.DISCOUNT = 0.00
                this.logger( `Warning`, `Catalog Price applied: ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`)
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "NiCFromMonthly",
    description: "Check if there are licenses in Monthly which are absent in Cases - and add them",
    action:  function (ents, nics, cases) {
        nics.forEach(nl => {
            const caseLic = cases.find(cl => nl.SKU === cl.skuid)
            const entLic = ents.find(el => nl.SKU === el.EXT_PROD_ID)
            if (caseLic === undefined && entLic !== undefined) {
                caseLic = {
                    skuid: nl.SKU, 
                    sku: nl.Product,
                    qtty: entLic.QNTY_THRESHOLD,
                    price: nc.Quantity > 0? nc.Amount / nc.Quantity: entlLic.NiCPrice
                }
                cases.push(caseLic)
                this.logger( `Warning`, `${nl.SKU} was not found in case2case but is required. Restored from Monthly file`)
            } else {
                this.logger( "ERROR", `${nl.SKU} was found in the Monthly file. CANNOT BE RESTORED!` )
                return false
            }
        })
        return true
    }
})
)

rules.push(new Rule ({
    name:  "NiCPorts",
    description: "Check/Fix NiC pors",
    action:  function (ents, nics, cases) {
    const casePortLic = cases.find(c => /^308-/.test(c.skuid))
    if (casePortLic === undefined) {
            this.logger( "ERROR", "NiC PortOverage license was not found" )
            return false
        }
        if (casePortLic.skuid !== facts.entPortLic.EXT_PRODUCT_ID) {
            this.logger(`Warning`, `inContact port ${casePortLic.skuid} replaced by ${facts.entPortLic.EXT_PRODUCT_ID} to match Entitlements`)
            casePortLic.skuid = facts.entPortLic.EXT_PRODUCT_ID
        }
        return true
    }
})
)

// rules.push(new Rule ({
//     name:  "NiCPrices",
//     description: "Check/Fix NiC Prices",
//     action:  function (ents, nics, cases) {
//         nics.forEach(nic => {
//             if (nic.Price === null) {
//                 const ind = cases.findIndex(c => c.skuid === nic.SKU)
//                 if (ind > -1) {
//                     nic.Price = cases[ind].price
//                     this.logger(`Warning`, `Case2case price selected for ${nic.SKU}`)
//                 } else {
//                     const ind2 = ents.findIndex(e => e.EXT_PRODUCT_ID === nic.SKU)
//                     if (ind2 > -1) {
//                         nic.Price = ents[ind2].NiCPrice
//                         this.logger( `Warning`, `NiC Catalog price selected for ${nic.SKU}`)
//                     } else {
//                         this.logger(`Error`, `Unknown price for ${nic.SKU}`)
//                     }
//                 }
//             }
//         })
//         console.table(ents.filter(row => /^30[7,8]-/.test(row.EXT_PRODUCT_ID) || row.QNTY_THRESHOLD>0 || -1 !== nics.findIndex(nic => nic.SKU === row.EXT_PRODUCT_ID)))
//         return true
//     }
// })
// )

exports.applyRules = (account, ents, nics, cases) => {
    const problems = []
    account["VALID"] = 'true'

    for (const rule of rules) {
        rule.reset()
        console.log(rule.description)
        const res = rule.action(ents, nics, cases)
        problems.push(...rule.logItems)
        if (!res) {
            account["VALID"] = 'false'
            break
        }
    }
    return problems
}
