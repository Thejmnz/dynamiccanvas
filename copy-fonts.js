const fs = require('fs');
const path = require('path');

const fontMapping = {
    'arial.ttf': 'Arial.ttf',
    'ariblk.ttf': 'Arial Black.ttf',
    'verdana.ttf': 'Verdana.ttf',
    'tahoma.ttf': 'Tahoma.ttf',
    'trebuc.ttf': 'Trebuchet MS.ttf',
    'times.ttf': 'Times New Roman.ttf',
    'georgia.ttf': 'Georgia.ttf',
    'gara.ttf': 'Garamond.ttf',
    'cour.ttf': 'Courier New.ttf',
    'brushsci.ttf': 'Brush Script MT.ttf',
    'pala.ttf': 'Palatino.ttf',
    'bookos.ttf': 'Bookman.ttf',
    'comic.ttf': 'Comic Sans MS.ttf',
    'impact.ttf': 'Impact.ttf',
    'l_1064.ttf': 'Lucida Sans Unicode.ttf',
    'lucon.ttf': 'Lucida Console.ttf',
};

const sourceDir = 'C:\\Windows\\Fonts';
const targetDir = path.join(process.cwd(), 'public', 'fonts');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

Object.entries(fontMapping).forEach(([sourceName, targetName]) => {
    const sourcePath = path.join(sourceDir, sourceName);
    const targetPath = path.join(targetDir, targetName);

    if (fs.existsSync(sourcePath)) {
        try {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied: ${sourceName} -> ${targetName}`);
        } catch (err) {
            console.error(`Error copying ${sourceName}: ${err.message}`);
        }
    } else {
        console.warn(`Not found: ${sourceName}`);
    }
});
