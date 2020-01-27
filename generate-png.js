const sharp = require('sharp');
const { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } = require("fs");
const path = require("path");

async function convertFolder(folder, targetFolder) {
    if (!existsSync(targetFolder)) {
        mkdirSync(targetFolder);
    }


    let last = [];
    const svgs = [last];

    const files = readdirSync(folder);
    for(const file of files) {
        const filePath = path.join(folder, file);
        const targetPath = path.join(targetFolder, file);
        const s = statSync(filePath);
        if(s.isDirectory()) {
            await convertFolder(filePath, targetPath);
            continue;
        }

        if (last.length > 5) {
            last = [];
            svgs.push(last);
        }

        last.push({ filePath, targetPath });
        
    };

    for (const task of svgs) {
        const all = task.map(async (x) => {
            const png = await sharp(x.filePath)
                .png()
                .resize(20)
                .flatten({ background: "#FFFFFF" })
                .removeAlpha()
                .toBuffer();
            writeFileSync(x.targetPath + ".png", png , "binary");
        });
        await Promise.all(all);
    }
}

(async() => {

    try {

        await convertFolder("./node_modules/@fortawesome/fontawesome-free/svgs", "./pngs");    
    } catch (e) {
        console.error(e.stack ? (e + "\r\n" + e.stack) : e);
    }
    
  //=> "/path/to/my-image.png"
})();