const fs = require("fs");

const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
p.name = "@web-atoms/font-awesome-pngs";
fs.copyFileSync("package.json", "package-original.json");
fs.writeFileSync("package.json", JSON.stringify(p));

