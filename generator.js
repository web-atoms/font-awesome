var fs = require("fs");

var icons = JSON.parse(fs.readFileSync("./icons.json"));

var package = JSON.parse(fs.readFileSync("./package.json"))
var packageVersion = package.version;

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

function generate(fontName, name, style, gen) {
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

            const img = `https://cdn.jsdelivr.net/npm/@web-atoms/font-awesome-pngs@${packageVersion}/pngs/${style}/${imgName}.svg.png`;

            const t = `
    /**
     * ${element.label} ![Image](${img})
     * Image Copyright FontAwesome.com
    */
    ${toIdentifier(key, lowerCase)}: ${gen(element)}`;
            list.push(t);
        }
    }

    const content = `// ts-lint:disable
declare var bridge: any;
const FontAwesome${name} = {
    ${list.join(",\r\n\t")},
    toString: () => {
        let name = this._fontName;
        if (name) {
            return name;
        }
        const p = bridge.platform;
        if (p) {
            if (/android/i.test(p)) {
                name = "${fontName}";
            } else if (/ios/i.test(p)) {
                name = "Font Awesome 5 Free";
            }
        } else {
            name = "Font Awesome 5 Free";
        }
        return name;
    }
};

export default FontAwesome${name};
`;

fs.writeFileSync(`./src/FontAwesome${name}.ts`, content);
}

generate("Font Awesome 5 Free-Regular-400.otf#Font Awesome 5 Free Regular", "Regular", "regular");
generate("Font Awesome 5 Free-Solid-400.otf#Font Awesome 5 Free Solid", "Solid", "solid");
generate("Font Awesome 5 Brands-Regular-400.otf#Font Awesome 5 Brands Regular", "Brands", "brands");