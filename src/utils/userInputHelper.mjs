import readLineSync from "readline-sync";

export const textReader = (question, defaultStr = "") => {
  const userResp = readLineSync.question(`${question} ["${defaultStr}"]: `);
  return userResp || defaultStr;
};

export const arrayReader = (question, defaultArr) => {
  const userResp = readLineSync
    .question(`${question} (comma separated; "x" to clear) [${defaultArr}]: `)
    .trim();
  if (!userResp.length) return defaultArr;
  if (userResp.toUpperCase() === "X") return [];
  return userResp.split(",");
};

export const boolReader = (question, defaultBool = true) => {
  do {
    const userResp = readLineSync
      .question(`${question} [${defaultBool ? "Y" : "N"}]: `)
      .toUpperCase();
    if (!userResp.length) return defaultBool;
    if (userResp === "Y" || userResp === "YES") return true;
    if (userResp === "N" || userResp === "NO") return false;
    console.log(`${userResp} is incorrect input. Enter Y or N`);
  } while (true);
};

export const intReader = (question, defaultInt, min = 0, max = 1_000_000) => {
  do {
    const userResp = readLineSync.question(`${question} [${defaultInt}]: `);
    if (!userResp.length) return defaultInt;
    const userRespInt = parseInt(userResp);
    if (
      isNaN(userRespInt) ||
      ((userRespInt > max || userRespInt < min) && userRespInt !== 0)
    ) {
      console.log(
        `${userResp} is incorrect input. Enter a number from ${min} to ${max} or 0 for unlimited`
      );
    } else {
      return userRespInt;
    }
  } while (true);
};

export const amountReader = (question, defaultAmount) => {
  do {
    const userResp = readLineSync.question(`${question} [${defaultAmount}]: `);
    if (!userResp.length) return defaultAmount;
    const userRespFloat = parseFloat(userResp.replace(/[\$,\,]/g, ""));
    if (!isNaN(userRespFloat)) return userRespFloat;
    console.log(
      `${userResp} is incorrect input. Enter an amount or 0 for unlimited`
    );
  } while (true);
};

export const optioner = (question, optionsArr, defaultOption) => {
  do {
    const optionsStr = optionsArr
      .map((o, ind) => `${ind + 1} - ${o}`)
      .join(", ");
    if (-1 === optionsArr.findIndex((o) => o === defaultOption))
      defaultOption = optionsArr.pop();
    const userResp = readLineSync.question(
      `${question}(${optionsStr})[${defaultOption}]: `
    );
    if (userResp === "") return defaultOption;
    if (
      isNaN(userResp) ||
      parseInt(userResp) > optionsArr.length ||
      parseInt(userResp) < 1
    ) {
      console.log(
        `Incorrect input. Enter a number from 1 to ${optionsArr.length}`
      );
    } else {
      return optionsArr[userResp - 1];
    }
  } while (true);
};
