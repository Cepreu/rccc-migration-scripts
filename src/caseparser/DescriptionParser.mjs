const extract = (line, pttrn, isNumber = false) => {
  const surr = isNumber ? "" : '"';
  let p = line.match(pttrn);
  return p ? surr + p[1].trim().replace(/"/g, "'") + surr : "NULL";
};

const parseTelecom = (line, lineParseParam, theCase, theAccount, theBUID) => {
  let insertVals = "";
  if (/\S/.test(line)) {
    const sku = extract(line, /[^ ]* ([^\$]*?)/);
    const skuId = extract(line, /([^ ]*?)/);
    const price = extract(line, /.*\$(.*)$/, true).replace(",", "");
    insertVals = `( "${theAccount}", "${theBUID}",  "${theCase}", "${lineParseParam}", ${skuId}, ${sku}, NULL, ${price} )`;
  }
  return insertVals;
};

const parseMRC = (line, lineParseParam, theCase, theAccount, theBUID) => {
  let insertVals = "";
  if (/\S/.test(line)) {
    if (/\[.+\]/.test(line)) {
      const sku = extract(line, /\][- ]+([^\$]*)/);
      const skuId = extract(line, /\[(.+?)\]/);
      const price = extract(line, /.*\$(.*)$/, true).replace(",", "");
      const qtty = extract(line, /(.*?)\[/, true);
      insertVals = `( "${theAccount}", "${theBUID}", "${theCase}", "${lineParseParam}", ${skuId}, ${sku}, ${qtty}, ${price} )`;
    } else {
      if (
        !/^Basic Care|CARE|Success|Plus Package/.test(line) &&
        !/^ACD\/IVR/.test(line) &&
        !/^Application Fee/.test(line)
      ) {
        console.error(
          `( "${theAccount}", "${theBUID}",  "${theCase}", "${lineParseParam}", "${line}")`
        );
      }
      insertVals = `( "${theAccount}", "${theBUID}", "${theCase}", "${lineParseParam}", null, "${line}", null, null )`;
    }
  }
  return insertVals;
};

const parseNotes = (line, lineParseParam, theCase, theAccount, theBUID) => {
  let noteStr = "";
  if (/\S/.test(line)) {
    noteStr = line.replace(/"/g, "'") + "..";
  }
  return noteStr;
};

export function parseDescription(
  descrTxt,
  theCase,
  theAccount,
  theBUID,
  results
) {
  const inputArr = descrTxt.split("\n");

  let lineParser = parseNotes;
  let lineParseParam = "";
  let note = "";
  const insertVals = [];

  while (inputArr.length > 0) {
    const theLine = inputArr.shift().trim();
    if (theLine.length === 0) continue;
    if (/^(ADD PRODUCTS|PRODUCTS):?$/.test(theLine)) {
      lineParser = parseMRC;
      lineParseParam = "ADD";
      continue;
    }
    if (/^(REDUCE PRODUCTS|REMOVE PRODUCTS):?$/.test(theLine)) {
      lineParser = parseMRC;
      lineParseParam = "REDUCE";
      continue;
    }
    if (
      /^(SERVICES|Services|SERVICE|ADD SERVICE|ADD SERVICES):?$/.test(theLine)
    ) {
      lineParser = parseMRC;
      lineParseParam = "SERVICES";
      continue;
    }
    if (/^TELECOM CHARGES:?$/.test(theLine)) {
      lineParser = parseTelecom;
      lineParseParam = "TELECOM";
      continue;
    }
    if (/^(NOTES?|Notes?)[:;]?( .*)?$/.test(theLine)) {
      lineParser = parseNotes;
      lineParseParam = "NOTES";
      if (theLine.length > "NOTES:".length) continue;
    }

    const item = lineParser(
      theLine,
      lineParseParam,
      theCase,
      theAccount,
      theBUID
    );
    if (lineParseParam === "ADD" || lineParseParam === "REDUCE") {
      insertVals.push(item);
    } else if (lineParseParam === "NOTES") {
      note += item;
    }
  }

  if (insertVals.length > 0) {
    const descrSQL =
      "INSERT INTO nic_case_items ( accountID, BUID, sfdcCase, operation, skuid, sku, qtty, price ) VALUES \n\t";
    results.cases = descrSQL + insertVals.join(",\n\t") + ";\n";
  }
  //	results.notes = `UPDATE nic_cases SET Notes=\"${note}\" WHERE CaseNumber=\"${theCase}\";\n`
  return true;
}

export const test1 = () => {
  const testDescr = `ADD PRODUCTS: 
202.00[312-913-000] - NICE inContact CXone Custom Storage (per Seat) $0.45
202.00[3347-21-000] - NICE inContact CXone Agent for Salesforce (per License) $10.60
202.00[12657-1725-000] - CXone Essentials Suite (per Configured User) $55.00
0.00[309-565-000] - NICE inContact CXone Long Term Storage (per GB) $0.03
0.00[309-566-000] - NICE inContact CXone Long Term Storage Retrieval (per GB) $0.414
0.00[308-8-170] - NICE inContact CXone Additional Configured Universal Port (Beyond 3 ports included) $22.50
0.00[309-11-171] - NICE inContact CXone Additional Active Storage (per GB) $0.30
100.00[3613-38-208] - NICE inContact CXone Personal Connection (per Configured User) $9.00
202.00[4102-1738-000] - CXone Quality Management Advanced Level Up (per Configured User) $4.20
1.00[1301-994-000] - NICE inContact CXone Messaging Application (per BU) $200.00
1.00[1300-988-000] - NICE inContact CXone Messaging Long Code [US/Canada] $4.00
1.00[1301-1617-000] - NICE inContact CXone Messaging - SMS Personal Connection Application Fee (Per BU) $400.00
1.00[1561-49-000] - CXsuccess Care Package $0.00

SERVICES: 
1.00[610187-914-000-XX] - Custom Storage Setup $400.00
1.00[610200-995-000-XX] - CXone Messaging Application Implementation $1,200.00 
1.00[12619-1398-000-XX] - CXone Messaging Long Code - SETUP $4.00 
1.00[1301-1617-000-XX-N] - CXone Messaging - SMS Personal Connection Application Fee (Per BU) - SETUP $400.00 

NOTES:
Platform - UserHub
Manual Outbound Transport - RingCentral
Implementation ACD/IVR - RingCentral
Agent for Salesforce - RingCentral
SMS - RingCentral
Personal Connection - RingCentral
Quality Management Advanced Level Up - RingCentral

Salesforce is under implementation and will be activated by the assigned IM/PM via Partner Implementations.

TELECOM CHARGES:
12619-328-000-XX Domestic Toll-Free Number - Setup $0.50
1051-371-000-XX Domestic Toll-Free Number - Account Activation $0.00
1270-136-000 Domestic Toll-Free Number - Monthly Recurring Charge $0.40
DOM_TF_FLAT_48INTRA_MIN Domestic Toll-Free Number - Flat Per-minute (Intrastate for 48 States) $0.008
DOM_TF_FLAT_INTER_MIN Domestic Toll-Free Number - Flat Per-minute (Interstate) $0.008
12619-333-000 Domestic Local Number - Setup $0.00
1051-372-000-XX Domestic Local Number - Account Activation $0.00
1012-150-000 Domestic Local Number - Monthly Recurring Charge $0.40
DOM_LN_MIN Domestic Local Number - Per-minute Charge $0.008
DOM_TERM_FLAT_INTER_MIN Domestic Termination - Flat Per-minute (Interstate) $0.008
DOM_TERM_FLAT_48INTRA_MIN Domestic Termination - Flat Standard Per-minute (Intrastate for 48 States) $0.008
`;
  const res = {};
  const theCase = "123456";
  parseDescription(testDescr, theCase, "987654", "22222", res);
  console.log(res.cases);
  if (res.hasOwnProperty("notes")) console.log(res.notes);
};
