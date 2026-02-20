const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsToDownload = [
    { name: 'Lato', family: 'Lato' },
    { name: 'Open Sans', family: 'Open Sans' },
    { name: 'Oswald', family: 'Oswald' },
    { name: 'Raleway', family: 'Raleway' },
    { name: 'Ubuntu', family: 'Ubuntu' },
    { name: 'Merriweather', family: 'Merriweather' },
    { name: 'Roboto', family: 'Roboto' },
    { name: 'Roboto Slab', family: 'Roboto Slab' },
    { name: 'Noto Sans', family: 'Noto Sans' },
    { name: 'Noto Serif', family: 'Noto Serif' },
];

const targetDir = path.join(process.cwd(), 'public', 'fonts');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadFont(font) {
    const url = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}`;

    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                // Extract the first .ttf or .woff2 URL from the CSS
                const match = data.match(/url\((https:\/\/fonts\.gstatic\.com\/s\/[^)]+)\)/);
                if (match && match[1]) {
                    const fontUrl = match[1];
                    const fileExt = fontUrl.split('.').pop();
                    const targetPath = path.join(targetDir, `${font.name}.${fileExt}`);

                    https.get(fontUrl, (fontRes) => {
                        const file = fs.createWriteStream(targetPath);
                        fontRes.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            console.log(`Downloaded: ${font.name} (${fileExt})`);
                            resolve();
                        });
                    }).on('error', reject);
                } else {
                    console.error(`Could not find font URL for ${font.name}`);
                    resolve();
                }
            });
        }).on('error', reject);
    });
}

(async () => {
    for (const font of fontsToDownload) {
        await downloadFont(font);
    }
    console.log('Finished downloading Google Fonts');
})();
