import readLineSync from "readline-sync";

export const textReader = (question: string, defaultStr = ""): string => {
  const userResp = readLineSync.question(`${question} ["${defaultStr}"]: `);
  return userResp || defaultStr;
};

export const arrayReader = (question: string, defaultArr: string[]): string[] => {
  const userResp = readLineSync
    .question(`${question} (comma separated; "x" to clear) [${defaultArr}]: `)
    .trim();
  if (!userResp.length) return defaultArr;
  if (userResp.toUpperCase() === "X") return [];
  return userResp.split(",");
};

export const boolReader = (question: string, defaultBool = true): boolean => {
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

export const intReader = (
  question: string,
  defaultInt: number,
  min = 0,
  max = 1_000_000
): number => {
  do {
    const userResp = readLineSync.question(`${question} [${defaultInt}]: `);
    if (!userResp.length) return defaultInt;
    const userRespInt = Number(userResp);
    if (
      !Number.isInteger(userRespInt) ||
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

export const amountReader = (question: string, defaultAmount: number): number => {
  do {
    const userResp = readLineSync.question(`${question} [${defaultAmount}]: `);
    if (!userResp.length) return defaultAmount;
    const userRespFloat = Number(userResp.replace(/[$,]/g, ""));
    if (Number.isFinite(userRespFloat)) return userRespFloat;
    console.log(
      `${userResp} is incorrect input. Enter an amount or 0 for unlimited`
    );
  } while (true);
};

export const optioner = <T>(
  question: string,
  optionsArr: readonly T[],
  defaultOption: T
): T => {
  do {
    const optionsStr = optionsArr
      .map((o, ind) => `${ind + 1} - ${o}`)
      .join(", ");
    if (!optionsArr.includes(defaultOption)) {
      defaultOption = optionsArr[optionsArr.length - 1];
    }
    const userResp = readLineSync.question(
      `${question}(${optionsStr})[${defaultOption}]: `
    );
    if (userResp === "") return defaultOption;
    if (
      !Number.isInteger(Number(userResp)) ||
      Number(userResp) > optionsArr.length ||
      Number(userResp) < 1
    ) {
      console.log(
        `Incorrect input. Enter a number from 1 to ${optionsArr.length}`
      );
    } else {
      return optionsArr[Number(userResp) - 1];
    }
  } while (true);
};
