import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import readLineSync from "readline-sync";
import { batchParametersMenu } from "./batchParametersMenu.mjs";

clear();
console.log(
  chalk.yellow(figlet.textSync("Migra-2", { horizontalLayout: "full" }))
);

console.log("1) Create New Batch");
console.log("2) Modify Batch");

const userRes = readLineSync.question("Pick an option: ");
if (userRes === "1") {
  console.log(batchParametersMenu());
} else if (userRes === "2") {
  const batchName = readLineSync.question("Batch name: ");
  console.log(batchParametersMenu(batchName));
}
console.log("G'buy");
