if (process.argv.length < 4) {
  return;
}
const inputFile = process.argv[2];
const outputFile = process.argv[3];

const fs = require("fs");
const UglifyJS = require("uglify-es");

let inputCode = fs.readFileSync(inputFile, "utf8");
inputCode = `(function(){${inputCode}})()`;

const result = UglifyJS.minify(inputCode);
let outputCode = result.code;
outputCode = `javascript:${outputCode}`;

fs.writeFileSync(outputFile, outputCode);