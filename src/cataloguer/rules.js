const mutuallyExclusives = [
    { 
        name: "Basic",
        licenses: [
            "Contact Center: Basic Edition Seat",
            "Contact Center: Basic Edition Seat 2 - 19",
            "Contact Center: Basic Edition Seat 20 - 99",
            "Contact Center: Basic Edition Seat 100 - 999",
            "Contact Center: Basic Edition Seat 1000 - 100000",
        ]
    }, { 
        name: "BasicWithAdvancedIVR",
        licenses: [
            "Contact Center: Basic Edition Seat with Advanced IVR (2 ports)",
            "Contact Center: Basic Edition Seat with Advanced IVR 2 - 19 (2 ports)",
            "Contact Center: Basic Edition Seat with Advanced IVR 20 - 99 (2 ports)",
            "Contact Center: Basic Edition Seat with Advanced IVR 100 - 999 (2 ports)",
            "Contact Center: Basic Edition Seat with Advanced IVR 1000 - 100000 (2 ports)",
        ]
    }, { 
        name: "BasicConcurrent",
        licenses: [
            "Contact Center: Basic Edition Concurrent Seat",
            "Contact Center: Basic Edition Concurrent Seat 2 - 19",
            "Contact Center: Basic Edition Concurrent Seat 20 - 99",
            "Contact Center: Basic Edition Concurrent Seat 100 - 999",
            "Contact Center: Basic Edition Concurrent Seat 1000 - 100000",
        ]
    }, { 
        name: "Advanced",
        licenses: [
            "Contact Center: Advanced Edition Seat",
            "Contact Center: Advanced Edition Seat 2 - 19",
            "Contact Center: Advanced Edition Seat 20 - 99",
            "Contact Center: Advanced Edition Seat 100 - 999",
            "Contact Center: Advanced Edition Seat 1000 - 100000",
        ]
    }, { 
        name: "AdvancedTwoPorts",
        licenses: [
            "Contact Center: Advanced Edition Seat (2 ports)",
            "Contact Center: Advanced Edition Seat 2 - 19 (2 ports)",
            "Contact Center: Advanced Edition Seat 20 - 99 (2 ports)",
            "Contact Center: Advanced Edition Seat 100 - 999 (2 ports)",
            "Contact Center: Advanced Edition Seat 1000 - 100000 (2 ports)",
        ]
    }, { 
        name: "Advanced-Plus",
        licenses: [
            "Contact Center: Advanced-Plus Edition Seat",
            "Contact Center: Advanced-Plus Edition Seat 2 - 19",
            "Contact Center: Advanced-Plus Edition Seat 20 - 99",
            "Contact Center: Advanced-Plus Edition Seat 100 - 999",
            "Contact Center: Advanced-Plus Edition Seat 1000 - 100000",
        ]
    }, { 
        name: "AdvancedConcurrent",
        licenses: [
            "Contact Center: Advanced Edition Concurrent Seat",
            "Contact Center: Advanced Edition Concurrent Seat 2 - 19",
            "Contact Center: Advanced Edition Concurrent Seat 20 - 99",
            "Contact Center: Advanced Edition Concurrent Seat 100 - 999",
            "Contact Center: Advanced Edition Concurrent Seat 1000 - 100000",
        ]
    }, { 
        name: "Ultimate",
        licenses: [
            "Contact Center: Ultimate Edition Seat",
            "Contact Center: Ultimate Edition Seat 2 - 19",
            "Contact Center: Ultimate Edition Seat 20 - 99",
            "Contact Center: Ultimate Edition Seat 100 - 999",
            "Contact Center: Ultimate Edition Seat 1000 - 100000",
        ]
    }, { 
        name: "UltimateTwoAndHalfPorts",
        licenses: [
            "Contact Center: Ultimate Edition Seat (2.5 ports)",
            "Contact Center: Ultimate Edition Seat 2 - 19 (2.5 ports)",
            "Contact Center: Ultimate Edition Seat 20 - 99 (2.5 ports)",
            "Contact Center: Ultimate Edition Seat 100 - 999 (2.5 ports)",
            "Contact Center: Ultimate Edition Seat 1000 - 100000 (2.5 ports)",
        ]
    }, { 
        name: "Ultimate-Plus",
        licenses: [
            "Contact Center: Ultimate-Plus Edition Seat",
            "Contact Center: Ultimate-Plus Edition Seat 2 - 19",
            "Contact Center: Ultimate-Plus Edition Seat 20 - 99",
            "Contact Center: Ultimate-Plus Edition Seat 100 - 999",
            "Contact Center: Ultimate-Plus Edition Seat 1000 - 100000",
        ]
    }, { 
        name: "UltimateConcurrent",
        licenses: [
            "Contact Center: Ultimate Edition Concurrent Seat",
            "Contact Center: Ultimate Edition Concurrent Seat 2 - 19",
            "Contact Center: Ultimate Edition Concurrent Seat 20 - 99",
            "Contact Center: Ultimate Edition Concurrent Seat 100 - 999",
            "Contact Center: Ultimate Edition Concurrent Seat 1000 - 100000",
        ]
    }, { 
        name: "PCI-Level1",
        licenses: [
            "Contact Center: PCI Level 1 Edition Seat (per Named-User)"
        ]   
    }
]

exports.getGroupName = name => {
    const ind = mutuallyExclusives.findIndex(m => -1 < m.licenses.findIndex(l => l === name))
    return ind > -1? mutuallyExclusives[ind].name: 'unknown'
}

const areMutuallyExclusive = (name1, name2) => {
    const ind1 = mutuallyExclusives.findIndex(m => -1 < m.licenses.findIndex(l => l === name1))
    const ind2 = mutuallyExclusives.findIndex(m => -1 < m.licenses.findIndex(l => l === name2))
    return ind1 >= 0 && ind2 >= 0 && ind1 != ind2
}

exports.isSeatEdition = sku => mutuallyExclusives.findIndex(m => -1 < m.licenses.findIndex(l => l === sku)) != -1


exports.checkItems = (entitlement, packageItem) => {
    let res = 'nomatch'
    if (entitlement.name === packageItem.name) {
        if (entitlement.skuId === packageItem.skuId) {
            if (entitlement.chargeTerm === packageItem.chargeTerm ) {
                res = (entitlement.price >= packageItem.price || entitlement.price12 >= packageItem.price12)? 'pricey': 'match'
            }
        } else if (entitlement.name === 'Port Overage') {
            res = 'exception'
        } else {
        res = 'split'
    }
} else if (areMutuallyExclusive(entitlement.name, packageItem.name)) {
        res = 'rule'
    }
    return res
}
