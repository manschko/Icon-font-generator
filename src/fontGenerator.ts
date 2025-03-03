import {SVGIcons2SVGFontStream} from "svgicons2svgfont";
import path from "path";
import fs from "fs";


const svgSourceDir = './node_modules/@material-symbols/svg-400/outlined';

type Options = {
    fontName?: string;
    normalize?: boolean;
    centerHorizontally?: boolean;
    centerVertically?: boolean;
}
function generateMaterialSymbolsFont(symbols: string[], options:Options = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const {
            fontName = 'Material Icons',
            normalize = true,
            centerHorizontally = true,
            centerVertically = true
        } = options;


        const fontStream = new SVGIcons2SVGFontStream({
            fontName: fontName,
            normalize: normalize,
            centerHorizontally: centerHorizontally,
            centerVertically: centerVertically

        });

        let svgFont = '';
        fontStream.on('data', data => {
            svgFont += data.toString();
        });

        fontStream.on('end', () => {
            resolve(svgFont);
        });

        fontStream.on('error', error => {
            reject(error);
        });

        // Process each symbol
        let pendingSymbols = symbols.length;
        if (pendingSymbols === 0) {
            fontStream.end();
            return;
        }

        symbols.forEach(symbolName => {
            const svgPath = path.join(__dirname, svgSourceDir, `${symbolName}.svg`);

            if (!fs.existsSync(svgPath)) {
                console.warn(`SVG file not found: ${svgPath}`);
                pendingSymbols--;
                if (pendingSymbols === 0) fontStream.end();
                return;
            }

            const glyph = fs.createReadStream(svgPath);

            // Add metadata for the glyph
            glyph.metadata = {
                unicode: [symbolName],
                name: symbolName,
            };

            fontStream.write(glyph);

            glyph.on('end', () => {
                pendingSymbols--;
                if (pendingSymbols === 0) fontStream.end();
            });
        });
    });
}