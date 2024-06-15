import * as fs from "fs";
import { getTime } from "./helpers";

function fileCheck(fileName: string) {
  return fs.existsSync(`${fileName}`);
}

export function logFileUse(fileName: string) {
  if (!fileCheck(fileName)) {
    fs.writeFileSync(fileName, "");
  }
}

export function writeToFile(fileName: string, text: string) {
  const currTime = new Date().toString().split("GMT").at(0);
  if (!fileCheck(fileName)) logFileUse(fileName);
  fs.writeFileSync(
    fileName,
    `${currTime}\n${text}\n------------------------\n`,
    { flag: "a" }
  );
}
