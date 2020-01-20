var fs = require("fs");

var icons = JSON.parse(fs.readFileSync("icons.json"));

function toIdentifier(name, lowerCase) {
    const a = name = name.split("-")
        .map((v, i) => {
            if (!i) {
                return (lowerCase ? v[0].toLowerCase() : v[0].toUpperCase()) + v.substr(1);
            }
            return v[0].toUpperCase() + v.substr(1);
        })
        .join("");
    if (/[^a-z]/i.test(a[0])) {
        return `_${a}`;
    }
    return a;
}

function generate(name, style, gen) {
    let lowerCase = false;
    if (!gen) {
        lowerCase = true;
    }
    gen = gen || ((item) => `"\\u${item.unicode}"`);

    var list = [];
    for (const key in icons) {
        if (icons.hasOwnProperty(key)) {
            const element = icons[key];
            if (element.styles.indexOf(style) === -1) {
                continue;
            }

            // const svg = Buffer.from(element.svg[style].raw).toString("base64");

            // const img = `data:image/svg;base64,${svg}`;

            const imgName = key;

            const img = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.12.0/svgs/${style}/${imgName}.svg`;

            const t = `
    /**
     * ${element.label} ![Image](${img})
    */
    ${toIdentifier(key, lowerCase)}: ${gen(element)}`;
            list.push(t);
        }
    }

    return `export const ${name} = {
    ${list.join(",\r\n\t")},
    toString: () => {
        let name = this._fontName;
        if (name) {
            return name;
        }
        const p = bridge.platform;
        if (p) {
            if (/android/i.test(p)) {
                name = "Font Awesome 5 Free-Regular-400.otf#Font Awesome 5 Free Regular";
            } else if (/ios/i.test(p)) {
                name = "Font Awesome 5 Free";
            }
        } else {
            name = "Font Awesome 5 Free";
        }
        return name;
    }
};
`;
}

let file = `
// ts-lint:disable
declare var bridge: any;
${generate("Regular", "regular")}
${generate("Solid", "solid")}
${generate("Brands", "brands")}
`;

fs.writeFileSync("./src/Icons.ts", file);

// function generator
function nodeGenerator(item) {
    return `(target) => (t, a, ... c) => new XNode(target, a, ... c)`;
}

// file = `
// // ts-lint:disable
// import XNode from "@web-atoms/core/dist/core/XNode";
// ${generate("Regular", "regular", nodeGenerator)}
// ${generate("Solid", "solid", nodeGenerator)}
// ${generate("Brands", "brands", nodeGenerator)}
// `;

// fs.writeFileSync("./src/FA.ts", file);