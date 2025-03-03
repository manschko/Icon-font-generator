import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import path from 'path';
import fs from 'fs';
import { createFontFiles } from './utils/font_utils';


type Options = {
    fontName?: string;
    normalize?: boolean;
    centerHorizontally?: boolean;
    centerVertically?: boolean;
    svgSourceDir?: string;
    outputDir?: string;
    ttf?: boolean
    woff?: boolean;
    woff2?: boolean;
}

function generateFontBufferFromSvg(symbols: string[], options: Options = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const {
            fontName = 'Custom Icon Font',
            normalize = true,
            centerHorizontally = true,
            centerVertically = true,
            svgSourceDir = '',
            outputDir = '.',
            woff = true,
            woff2 = true
        } = options;

        if (!svgSourceDir) {
            console.error('❗SVG source directory is required');
            reject('SVG source directory is required');
        }

        const fontStream = new SVGIcons2SVGFontStream({
            fontName: fontName,
            normalize: normalize,
            centerHorizontally: centerHorizontally,
            centerVertically: centerVertically

        });

        const chunks: Buffer[] = [];
        fontStream.on('data', data => {
            chunks.push(data);
        });

        fontStream.on('end', () => {
            resolve(Buffer.concat(chunks));
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
                console.warn(`⚠️SVG file not found: ${svgPath}`);
                pendingSymbols--;
                if (pendingSymbols === 0) fontStream.end();
                return;
            }

            const glyph = fs.createReadStream(svgPath);

            // Add metadata for the glyph
            (glyph as any).metadata = {
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

function generateMaterialSymbolsFont(symbols: string[], options: Options = {}): void {
    const {
        fontName = 'Material Icons',
        normalize = true,
        centerHorizontally = true,
        centerVertically = true,
        svgSourceDir = './node_modules/@material-symbols/svg-400/outlined',
        outputDir = '.',
        ttf = true,
        woff = true,
        woff2 = true
    } = options;
    generateFontBufferFromSvg(symbols, {
        fontName,
        normalize,
        centerHorizontally,
        centerVertically,
        svgSourceDir,
        outputDir,
        woff,
        woff2
    }).then(fontBuffer => {
        createFontFiles(fontName, fontBuffer, outputDir, ttf, woff, woff2);
    });
}