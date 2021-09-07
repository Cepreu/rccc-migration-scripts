const customerOrders = [
    {
        CustomerID:"E1", 
        entitlements: [
            {skuId:'307-86-00', name:'Seat: Basic Edition'},
            {skuId:'V1', name:'P1'},
            {skuId:'V2', name:'P2'},
            {skuId:'V3', name:'P3'},
            {skuId:'V4', name:'P4'}
        ]
    }, {
        CustomerID:"E2", 
        entitlements: [
            {skuId:'307-86-00', name:'Seat: Basic Edition'},
            {skuId:'V1', name:'P1'},
            {skuId:'V3', name:'P3'},
            {skuId:'V5', name:'P5'}
        ]
    }, {
        CustomerID:"E3",
        entitlements: [
            {skuId:'307-86-00', name:'Seat: Basic Edition'},
            {skuId:'V1', name:'P1'},
            {skuId:'V3', name:'P4'},
            {skuId:'V5', name:'P5'},
        ]
    }, {
        CustomerID:"E4", 
        entitlements: [
            {skuId:'308-99-00', name:'Seat: Advanced Edition'},
            {skuId:'V1', name:'P1'},
            {skuId:'V3', name:'P3'},
            {skuId:'V5', name:'P5'}
        ]
    }, {
        CustomerID:"E5",
        entitlements: [
            {skuId:'308-99-00', name:'Seat: Advanced Edition'},
            {skuId:'V1', name:'P1'},
            {skuId:'V4', name:'P4'},
            {skuId:'V5', name:'P5'}
        ]
    }
]

exports.getTestOrder = prevOrder => {
    if (prevOrder) {
        let ind = customerOrders.findIndex(ord => ord.CustomerID === prevOrder.CustomerID)
        ind++
        return (ind > 0 && ind < customerOrders.length)? customerOrders[ind]: null 
    } else {
        return customerOrders[0]
    }
}
