const OVERAGE = 'Overage'

class Rule {
    static portMap = {
        CCL_LRCCCU2SEATO_73: ['CCL_LAPRTUESO_412','CCL_LAPRTUPESO_413'],
        CCL_LRCCCA2SEATO_67: ['CCL_LAPRTAAE2O_405','CCL_LAPRTAAPEO_404'],
        CCL_LRCCCUCSEATO_61: ['CCL_LAPRTUPESO_413', 'CCL_LAPRTAUECO_406'],
        CCL_LRCCCACSEATO_56: ['CCL_LAPRTAAECO_403'],
        CCL_LRCCCBASEATO_44: ['CCL_LAPRTBESWAO_411'],
        CCL_LRCCCUPSEATO_32: ['CCL_LAPRTUPESO_413'],
        CCL_LRCCCAPSEATO_26: ['CCL_LAPRTAAPEO_404'],
        CCL_LRCCCUSEATO_20:  ['CCL_LAPRTAUEO_402'],
        CCL_LRCCCA1SEATO_14: ['CCL_LAPRTBESO_409']
    }
    
    static RCOTelecomLicenses = [
        { Category: "CCL_LICIBL_78", ITEM_NAME: "Inbound Local, per 10 min", USD: 0.00, CAD: 0 },
        { Category: "CCL_LICIBTF_79", ITEM_NAME: "Inbound Toll Free, per 10 min", USD: 0.14, CAD: 0.14 },
        { Category: "CCL_LICIBINT_81", ITEM_NAME: "Inbound International", USD: 0.01, CAD: 0.01 },
        { Category: "CCL_LICOBLC_83", ITEM_NAME: "Outbound Local Conversational, per 10 min", USD: 0.00, CAD: 0.00 },
        { Category: "CCL_LICOBIC_84", ITEM_NAME: "Outbound International Conversational", USD: 0.01, CAD: 0.01 },
        { Category: "CCL_LICOBDL_85", ITEM_NAME: "Outbound Dialer Local, per 10 min", USD: 0.16, CAD: 0.16 },
        { Category: "CCL_LICOBDINT_87", ITEM_NAME: "Outbound Dialer International", USD: 0.01, CAD: 0.01 },
        { Category: "CCL_LICOBLTF_88", ITEM_NAME: "Outbound local Toll Free", USD: 0.00, CAD: 0.00 }
    ]
    static ASR_OVERAGE = 
    { Category: "CCL_LASRO_620",  ITEM_NAME: "Contact Center: Automated Speech Recognition (per minute)", USD: 0.06, CAD: 0.08, NiCPrice: 0.05 }
    
    static BUNDLE25K = 
    { Category: 'CCL_LICIBTF25KB_80', ITEM_NAME: 'Inbound Toll Free 25K Bundle', USD: 350.00, CAD: 450.00 }
    
    static Exceptions = [
        '1561-49-000',        // Service Package - CXsuccess Care Package
        '3157-18-204',        // Chat  and Email Channel - CXone Chat & Email (per Configured User)
        '1028-171-000'        // SIP Trunking Service - CXone SIP Connectivity over Internet
    ]
    
    constructor({description=''} = {}) {
        this.description = description
    }
    get name() {return this.constructor.name}
} 

/////////////
class RCCheckSeats extends Rule {
    constructor() {
        super({
            description: "Checks seats"
        })
    }
    action(acct) {
        const seats = acct.ents.filter(row => /^307-/.test(row.EXT_PRODUCT_ID) && row.ITEM_NAME !== 'Seat Overage')
        if (seats.length !== 1) {
            acct.logError( this.name, "Incorrect number of Seat licenses (was not found more tham one)" )
            return false
        }

        let strippedName = seats[0].ITEM_NAME
        const x = seats[0].ITEM_NAME.match(/ \d+ \- \d+/)
        if (x) strippedName = strippedName.replace(x[0], '')

        acct.facts.seat = acct.ents.find(row => row.EXT_PRODUCT_ID === seats[0].EXT_PRODUCT_ID 
            && row.ITEM_NAME === 'Seat Overage'
            && row.Parent === strippedName)
        if (acct.facts.seat === undefined) {
            acct.logError( this.name, "Seat overage license was not found or doesn't match the seat license" )
            return false
        }

        for( let i = 0; i < acct.ents.length; i++) { // Cleanup of extra seat overages if any
            if (/^307-/.test(acct.ents[i].EXT_PRODUCT_ID) 
                && acct.ents[i].Category !== seats[0].Category
                && acct.ents[i].Category !== acct.facts.seat.Category) {
                    acct.logInfo(this.name, `Removed: ${acct.ents[i].EXT_PRODUCT_ID} ${acct.ents[i].ITEM_NAME}`)
                    acct.ents.splice(i--, 1)
            }
        }
        return true
    }
}

class RCPorts4Seats extends Rule {
    constructor() {
        super({
            description: "Checks if ports match seats"
        })
    }
    action(acct) {
        if (!Rule.portMap.hasOwnProperty(acct.facts.seat.Category)) {
            const theIssue = `Unknown port2seat mapping: ${acct.facts.seat.Category}`
            acct.logError( this.name, theIssue)
            return false
        }
        return true
    }
}

/////////////
class RCFixPorts extends Rule {
    constructor() {
        super({
            description: "Check/Fix Ports"
        })
    }
    action(acct) {
        const nicPort = acct.nics.find(nic => /^308-/.test(nic.SKU))  //Sub-rule #1
        if (nicPort !== undefined) {
            const entPorts = acct.ents.filter(e => e.EXT_PRODUCT_ID === nicPort.SKU)
            if (entPorts.length === 0) {
                const theIssue = "RC PortOverage license was not found or doesn't match MRC"
                acct.logError( this.name, theIssue)
                return false
            } else {
                acct.facts.entPortLic = entPorts[0]
                if (entPorts.length > 1) {
                    const p = entPorts.find(e => -1 < Rule.portMap[acct.facts.seat.Category].findIndex(p => p === e.Category)) // Expected port by seat type
                    if (p!==undefined) acct.facts.entPortLic = p; 
                }
            }
        } else { //Sub-rule #2
            // const casePort = acct.cases.find(c => /^308-/.tect(c.skuid))
            const entPorts = acct.ents.filter(row => /^308-/.test(row.EXT_PRODUCT_ID))
            if (entPorts.length === 0) {
                acct.logError( this.name, "RC PortOverage license was not found")
                return false
            }
            acct.facts.entPortLic = entPorts[0]
            if (entPorts.length > 1) {
                const p = entPorts.find(e => -1 < Rule.portMap[acct.facts.seat.Category].findIndex(p => p === e.Category)) // Expected port by seat type
                if (p!==undefined) acct.facts.entPortLic = p; 
            }
        }

        for( let i = 0; i < acct.ents.length; i++) { // Cleanup of extra ports
            if (/^308-/.test(acct.ents[i].EXT_PRODUCT_ID) && acct.ents[i].Category !== acct.facts.entPortLic.Category) {
                acct.ents.splice(i--, 1)
            }
        }
        return true
    }
}

/////////////
class RCExtraOverages extends Rule {
    constructor() {
        super({
            description: "Remove overage licenses without direct order"
        })
    }
    action(acct) {
        for( let i = 0; i < acct.ents.length; i++) {
            if (
                acct.ents[i].ProductFamily === OVERAGE &&
                acct.ents[i].Category !== 'CCL_LASRO_620' &&
                -1 === acct.cases.findIndex(c => c.skuid === acct.ents[i].EXT_PRODUCT_ID) && 
                -1 === acct.nics.findIndex( n => n.SKU === acct.ents[i].EXT_PRODUCT_ID)
            ) {
                acct.logInfo(this.name, `Removed: ${acct.ents[i].EXT_PRODUCT_ID} ${acct.ents[i].ITEM_NAME}`)
                acct.ents.splice(i--, 1)
            }
        }
        return true
    }
}

//////////////////
class RCNegDiscounts extends Rule {
    constructor() {
        super({
            description: "Sanity check: Reject the migration if negative discount was found"
        })
    }
    action(acct) {
        const neg = acct.ents.find(e => e.DISCOUNT < 0)
        if (neg === undefined) {
            return true
        }
        const theIssue = `Negative discount ${neg.DISCOUNT} for: ${neg.EXT_PRODUCT_ID} ${neg.ITEM_NAME}`
        acct.logError( this.name, theIssue)
        return false
    }
}

//////////////////
class RCFixPrices2 extends Rule {
    constructor() {
        super({
            description: "RC: fix Usage Licenses"
        })
    }
    action(acct) {
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
            const i = acct.ents.findIndex(ent => e === ent.Category)
            if (i >= 0) {
                acct.ents[i].DISCOUNT = 0.00
                const theIssue = `Catalog Price applied: ${acct.ents[i].Category} (${acct.ents[i].EXT_PRODUCT_ID}) ${acct.ents[i].ITEM_NAME}`
                acct.logWarning(this.name, theIssue)
            }
        })
        return true
    }
}

//////////////////
class RCProfServOnDemand extends Rule {
    constructor() {
        super({
            description: "Delete Professional Service Licenses"
        })
    }
    action(acct) {       
        const toDeleteNames = [
            '610064-000-000',
            '610064-302-000',
        ]
        toDeleteNames.forEach(tdn => {
            const i = acct.ents.findIndex(e => e.EXT_PRODUCT_ID === tdn)
            if (i >= 0) {
                const theIssue = `Removed: ${acct.ents[i].EXT_PRODUCT_ID} ${acct.ents[i].ITEM_NAME}`
                acct.logInfo(this.name,  theIssue)
                acct.ents.splice(i, 1)
            }
        })
        return true
    }
}
    
//////////////////
class RCOldTelco extends Rule {
    constructor() {
        super({
            description: "Delete old Telecom Licenses"
        })
    }
    action(acct) {         
        const toDeleteNames = [
            'International Minutes Overage',
            'IVN Minutes Overage',
            'Domestic Minutes Overage'
        ]
        toDeleteNames.forEach(tdn => {
            const i = acct.ents.findIndex(e => e.ITEM_NAME === tdn)
            if (i >= 0) {
                const theIssue = `Removed: ${acct.ents[i].EXT_PRODUCT_ID} ${acct.ents[i].ITEM_NAME}`
                acct.logInfo(this.name, theIssue)
                acct.ents.splice(i, 1)
            }
        })
        return true
    }
}
    
//////////////////
class RCNewTelco extends Rule {
    constructor() {
        super({
            description: "Add Free Domestic Telephony Licenses"
        })
    }
    action(acct) {
        Rule.RCOTelecomLicenses.forEach(tl => {
            if (acct.ents.find(e => e.Category === tl.Category) === undefined) {
                acct.ents.push({
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
                const theIssue = `Added: ${tl.Category} ${tl.ITEM_NAME}`
                acct.logInfo(this.name,  theIssue)
            }
        })
        return true
    }
}

//////////////////
class RCASROverage extends Rule {
    constructor() {
        super({
            description: "Add ASR Overage License - if it was originally omitted"
        })
    }
    action(acct) {
        if (acct.ents.find(e => e.Category === Rule.ASR_OVERAGE.Category) === undefined) {
            acct.ents.push({
                EXT_PRODUCT_ID: null,
                Category: Rule.ASR_OVERAGE.Category,
                ITEM_NAME: Rule.ASR_OVERAGE.ITEM_NAME,
                QNTY_THRESHOLD: 0,
                PRICE: acct.CURRENCY==='USD'? Rule.ASR_OVERAGE.USD: Rule.ASR_OVERAGE.CAD,
                DISCOUNT: 0,
                NiCPrice: Rule.ASR_OVERAGE.NiCPrice,
                CURRENCY: acct.CURRENCY,
                ProductFamily: OVERAGE,
                batchID: ""
            })
            const theIssue = `Added: ${Rule.ASR_OVERAGE.Category} ${Rule.ASR_OVERAGE.ITEM_NAME}`
            acct.logInfo(this.name,  theIssue)
        }
        return true
    }
}

//////////////////
class RC25kBundles extends Rule {
    constructor() {
        super({
            description: "Convert different-size toll-free bundles to 25K"
        })
    }
    action(acct) {
        for( let i = 0; i < acct.ents.length; i++) {
            const bndl = acct.ents[i].ITEM_NAME.match(/Contact Center: (?<Mega>\d+M )?(?<Kilo>\d+K )?Domestic Minutes Bundle/)
            if (bndl) {
                acct.logInfo(this.name, `Replaced: "${acct.ents[i].ITEM_NAME}" with 25K bundles`)
            
                const {Mega, Kilo} = bndl.groups
                const qtty = (
                    (Mega? 40 * Mega.slice(0, -2): 0) +
                    (Kilo? 0.04 * Kilo.slice(0, -2): 0) 
                ) * acct.ents[i].QNTY_THRESHOLD

                acct.ents[i].Category = Rule.BUNDLE25K.Category
                acct.ents[i].ITEM_NAME = Rule.BUNDLE25K.ITEM_NAME
                acct.ents[i].QNTY_THRESHOLD = qtty
                acct.ents[i].PRICE = acct.ents[i].CURRENCY==='USD'? Rule.BUNDLE25K.USD: Rule.BUNDLE25K.CAD
                acct.ents[i].DISCOUNT = acct.ents[i].PRICE - (acct.ents[i].OldPrice) / qtty
                acct.ents[i].ProductFamily = OVERAGE

                break
            }
        }
        return true
    }
}

//////////////////
class RCFixSocMedia extends Rule {
    constructor() {
        super({
            description: "Fix Social Media Overages"
        })
    }
    action(acct) {
        for( let i = 0; i < acct.ents.length; i++) {
            if (/^1502-/.test(acct.ents[i].EXT_PRODUCT_ID) && acct.ents[i].ProductFamily === OVERAGE) {
                acct.logInfo(this.name, `Removed: ${acct.ents[i].EXT_PRODUCT_ID} ${acct.ents[i].ITEM_NAME}`)
                acct.ents.splice(i--, 1)
            }
        }
        return true
    }
}

//////////////////
class RCFixNames extends Rule {
    constructor() {
        super({
            description: "RC: fix Names"
        })
    }
    action(acct) {
        const targetSkus = ['4100-701-000', '1503-693-000', '1503-694-000', '4109-673-000', '500-617-000', '308-8-167', '3465-1227-000']
        acct.ents.forEach(ent => {
            if (targetSkus.find(e => e === ent.EXT_PRODUCT_ID)) {
                const theIssue = `. : ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`
                acct.logWarning(this.name, theIssue)
            }
        })
        return true
    }
}

//////////////////
class RCFixPrices extends Rule {
    constructor() {
        super({
            description: "RC: fix Usage Licenses",
        })
    }
    action(acct) {
        const targetSkus = ['4109-673-000', '3399-769-000']
        acct.ents.forEach(ent => {
            if (targetSkus.find(e => e === ent.EXT_PRODUCT_ID) && ent.ProductFamily === OVERAGE) {
                ent.DISCOUNT = 0.00
                const theIssue = `Catalog Price applied: ${ent.EXT_PRODUCT_ID} ${ent.ITEM_NAME}`
                acct.logWarning(this.name, theIssue)
            }
        })
        return true
    }
}

//////////////////
class NiC_StripXX extends Rule {
    constructor() {
        super({
            description: "RC: Removing the _XX suffix in C2C (to enable further matching)",
        })
    }
    action(acct) {
        const listXX = acct.cases.filter(c=>c.skuid.slice(-3) === '-XX').map(x=>x.skuid)
        if (listXX.length) {
            acct.cases.forEach(c2c => c2c.skuid = c2c.skuid.replace(/\-XX$/,''))
            acct.logWarning(this.name, `Removed "-XX" suffix in the following c2c sku(s): ${listXX.join(', ')}`)
        }
        return true
    }
}

 //////////////////
class NiC_MRCvsDWH extends Rule {
    constructor() {
        super({
            description: "Check if there are licenses in Monthly which are absent in RC entitlements."
        })
    }
    action(acct) {
        let rule_res = true 
        acct.nics.forEach(nl => {
            const entLic = acct.ents.find(el => nl.SKU === el.EXT_PRODUCT_ID)
            if (entLic === undefined) {
                if (nl.Amount == 0.00 && Rule.Exceptions.find(ex => nl.SKU === ex) !== undefined) {
                    const theIssue = `${nl.SKU}  was found in NiC MRS file but not in RC entitlements. Ignored as a known exception`
                    acct.logWarning(this.name, theIssue)
                } else {
                    acct.logError(
                        this.name, 
                        `${nl.SKU} ($${nl.Amount}) was found in NiC MRS file but not in RC entitlements.`
                    )
                    rule_res = false
                } 
            }
        })
        return rule_res
    }
}


//////////////////
class NiC_NotFound extends Rule {
    constructor() {
        super({
            description: "Check if the account is represented in Monthly",
        })
    }
    action(acct) {
        if (acct.nics.length === 0) {
            acct.logError(this.name, `No records were found for the account in Monthly file`)
            return false
        }
        return true
    }
}

//////////////////
class NiC_C2CvsMRC extends Rule {
    constructor() {
        super({
            description: "(1) Checks if there are licenses in Cases which are absent in Monthly, (2) Checks if the prices are the same",
        })
    }
    action(acct) {
        let rule_res = true
        acct.cases.forEach(c2c => {
            const nicLic = acct.nics.find(nl => nl.SKU === c2c.skuid)
            if (nicLic === undefined) {
                acct.logWarning(this.name, `${c2c.skuid} was not found in Monthly file but is presented in case2case`)
            }  else if (nicLic.Quantity > 0) {
                const p = Math.round(nicLic.Amount / nicLic.Quantity * 100) / 100
                if (c2c.price != p) {
                    acct.logWarning(this.name, `Different prices ${c2c.skuid}: $${c2c.price} in cases vs $${p} in Monthly`)
                }
            }
        })
        return rule_res
    }
}

//////////////////
class NiC_MRCvsC2C extends Rule {
    constructor() {
        super({
            description: "Check if there are licenses in Monthly which are absent in cases - and add them",
        })
    }
    action(acct) {
        let rule_res = true 
        acct.nics.forEach(nl => {
            const caseLic = acct.cases.find(cl => nl.SKU === cl.skuid)
            if (caseLic === undefined && Rule.Exceptions.find(ex => nl.SKU === ex) === undefined) {
                const entLic = acct.ents.find(el => nl.SKU === el.EXT_PRODUCT_ID)
                if (entLic === undefined) {
                    acct.logError( this.name, `${nl.SKU} was not found in case2case but is presented in Monthly file. CANNOT BE RESTORED!`)
                    rule_res = false
                    return
                }
                if (nl.Quantity > 0) {
                    acct.cases.push({
                            skuid: nl.SKU, 
                            sku: nl.Product,
                            qtty: entLic.QNTY_THRESHOLD,
                            price: nl.Amount / nl.Quantity
                        })
                        const theIssue = `${nl.SKU} was not found in case2case but is presented in Monthly file`
                        acct.logWarning(this.name, theIssue)
                } else {
                    acct.cases.push({
                        skuid: nl.SKU, 
                        sku: nl.Product,
                        qtty: entLic.QNTY_THRESHOLD,
                        price: entLic.NiCPrice
                    })
                    const theIssue = `${nl.SKU} was not found in case2case but is presented in MRC. Price was added from the entitlement`
                    acct.logWarning(this.name, theIssue)
                }
            }
        })
        return rule_res
    }
}


//////////////////
class RCCMapping extends Rule {
    constructor() {
        super({
            description: "Checks if there are no acct.problems with mapping ITBS licenses to NGBS catalog"
        })
    }
    action(acct) {
        const bad = acct.ents.filter(row => row.Category === null)
        bad.forEach(ent => {
            acct.logError( 
                this.name,
                `${ent.EXT_PRODUCT_ID !== null? ent.EXT_PRODUCT_ID: ''} "${ent.ITEM_NAME}" - is not mapped to NGBS catalog`
            )
        })
        return !bad.length
    }
}

//////////////////
class NiCPorts extends Rule {
    constructor() {
        super({
            description: "Check/Fix NiC pors",
        })
    }
    action(acct) {
        const casePortLic = acct.cases.find(c => /^308-/.test(c.skuid))
        if (casePortLic === undefined) {
            acct.logError( this.name, "NiC PortOverage license was not found")
            return false
        }
        if (casePortLic.skuid !== acct.facts.entPortLic.EXT_PRODUCT_ID) {
            const theIssue = `inContact port ${casePortLic.skuid} replaced by ${acct.facts.entPortLic.EXT_PRODUCT_ID} to match Entitlements`
            acct.logWarning(this.name, theIssue)
            casePortLic.skuid = acct.facts.entPortLic.EXT_PRODUCT_ID
        }
        return true
    }
}

//////////////////////////////////
export class RuleEngine {
  
    constructor() {
        this.rules = [
            new RCCheckSeats(),
            new RCPorts4Seats(),
            new RCFixPorts(),
            new RCExtraOverages(),
            new RCNegDiscounts(),
            new RCFixPrices2(),
            new RCProfServOnDemand(),
            new RCOldTelco(),
            new RCNewTelco(),
            new RCASROverage(),
            new RC25kBundles(),
            new RCFixSocMedia(),
            new RCFixNames(),
            new RCFixPrices(),
            new NiC_NotFound(),
            new NiC_StripXX(),
            new NiC_C2CvsMRC,
            new NiC_MRCvsDWH(),
            new NiC_MRCvsC2C(),
            new RCCMapping(),
            new NiCPorts()
        ]
    }
    run(acct) {
        acct.facts = {}
        let skipRules = false
        this.rules.forEach( rule => {
            if (!skipRules) {
                console.log(rule.description)
                const res = rule.action(acct)
                if (!res) {
                    skipRules = true
                }
            }
        })
        return !skipRules
    }
}