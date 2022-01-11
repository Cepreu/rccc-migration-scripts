const date = require('date-and-time')
const fs = require('fs')
const {parseDescription} = require('./DescriptionParser')

const insertFields = [{field: 'Notes', value: ''}]


/////////////////
////
//////////////////
const parseCases = (inputArr) => { 

	let theCase = ''

	while (inputArr.length > 0) {
		const theLine = inputArr.shift()
		switch (theLine) {
    		case "Case Number":
				theCase = inputArr.shift()
				insertFields.push( {field: "CaseNumber", value: `"${theCase}"`} )
				break
    		case "Opportunity Reference":
				insertFields.push( {field: "Opportunity", value: `"${inputArr.shift()}"`} )
				break
    		case "Account Name":
				if (theCase != '') {
					handleCase()
					insertFields.length = 0 // Clear the array
					insertFields.push({field: 'Notes', value: ''})
        			theCase = ''
				}
			case "Status":
			case "Order":
			case "RingCentral UID":
    		case "Default Time Zone":
			case "RingCentral Account Number":
			case "Geo Region":
			case "Subject":
				const f = theLine.replace(/\s+/g, "")
				const v = inputArr.shift()
				insertFields.push( {field: f, value: `"${v}"`} )
				break
    		case "inContact BU ID":
				insertFields.push( {field: "BUID", value: `"${inputArr.shift()}"`} )
				break
			case "CC Order Type":
				insertFields.push( {field: "Type", value: `"${inputArr.shift()}"`} )
				break
    		case "inContact Status":
				insertFields.push( {field: "Status", value: `"${inputArr.shift()}"`} )
				break
    		case "inContact Segment":
				insertFields.push( {field: "Segment", value: `"${inputArr.shift()}"`} )
				break
			case "Provision Date":
				const pd = inputArr.shift()
				if (date.isValid(pd, 'M/D/YYYY')) {
					insertFields.push( {field: "ProvisionDate", value: `"${date.transform(pd, 'M/D/YYYY', 'YYYY-MM-DD')}"`} )
				} else {
					insertValues.push({field: "ProvisionDate", value: 'NULL'})	
				}
				break
			case "Description":
				console.log(parseDescription(inputArr, theCase))
		}
	}
	if (theCase != '') {
		handleCase()
		insertFields.length = 0 // Clear the array
		insertFields.push({field: 'Notes', value: ''})
		theCase = ''
	}
}

const handleCase = () => {
	const res = 'INSERT INTO nic_cases ( \n\t' 
				+ insertFields.map(e => e.field).join(',\n\t')
				+ '\n) VALUES (\n\t'
				+ insertFields.map(e => e.value).join(',\n\t')
				+ '\n);'
	console.log(res)
}


exports.insertCase = (file) => {
	console.log(`====== ${file} =======`)
	const inputArr = fs.readFileSync(file).toString().split("\n")
	parseCases(inputArr)
}
