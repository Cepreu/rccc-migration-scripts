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
    if (/^(NOTES?|Notes?)[:;.]?( .*)?$/.test(theLine)) {
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
