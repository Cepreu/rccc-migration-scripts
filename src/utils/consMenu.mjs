import readLineSync from "readline-sync";

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";

export default (optArr, upper = false) => {
  if (upper) {
    clear();
    console.log(
      chalk.yellow(figlet.textSync("Migra-2", { horizontalLayout: "full" }))
    );
  }
  let prompt = optArr.map((opt, ind) => `${ind + 1}) ${opt}`).join("\n");
  let re = new RegExp(
    "^(" + optArr.map((opt, ind) => `${ind + 1}`).join("|") + ")$"
  );
  let wrn = "";
  let r;
  do {
    console.log(wrn + prompt);
    r = readLineSync.question("Pick an option: ");
    wrn = `ATTENTION: "${r}" is incorrect input\n`;
  } while (!re.test(r));
  return parseInt(r) - 1;
};
