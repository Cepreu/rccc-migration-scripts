import readLineSync from "readline-sync";

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";

export default <T>(optArr: readonly T[], upper = false): number | undefined => {
  if (upper) {
    clear();
    console.log(
      chalk.yellow(figlet.textSync("Migra-2", { horizontalLayout: "full" }))
    );
  }

  let wrn = "";
  let input = "";
  let selection = Number.NaN;
  do {
    console.log(wrn);
    console.table(["(Exit)", ...optArr]);
    input = readLineSync.question("Pick an option: ").trim();
    selection = Number(input);
    wrn = `ATTENTION: "${input}" is incorrect input\n`;
  } while (
    !Number.isInteger(selection) ||
    selection < 0 ||
    selection > optArr.length
  );
  return selection > 0 ? selection - 1 : undefined;
};
