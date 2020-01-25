const { convert }  = require('convert-svg-to-png');
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
            const data = readFileSync(x.filePath, "binary");
            const png = await convert(data, { background: "white", height: 50 });
            writeFileSync(x.targetPath, png , "binary");
        });
        await Promise.all(all);
    }
}

(async() => {

    await convertFolder("./node_modules/@fortawesome/fontawesome-free/svgs", "./pngs");    
    
  //=> "/path/to/my-image.png"
})();