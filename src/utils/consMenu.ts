import readLineSync from "readline-sync";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";

export default function (optArr: string[], upper = false): number | undefined {
  if (upper) {
    clear();
    console.log(
      chalk.yellow(figlet.textSync("Migra-2", { horizontalLayout: "full" }))
    );
  }
  let wrn = "";
  let r: string;
  do {
    console.log(wrn);
    console.table(["(Exit)", ...optArr]);
    r = readLineSync.question("Pick an option: ");
    wrn = `ATTENTION: "${r}" is incorrect input\n`;
  } while (isNaN(r as any) || parseInt(r) > optArr.length);
  const R = parseInt(r);
  return R > 0 ? R - 1 : undefined;
}
