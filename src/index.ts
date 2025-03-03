import fs from 'fs';
import path from 'path';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont'
import svg2ttf from 'svg2ttf';

// Configuration options
interface Config {
    symbolsFilePath: string;
    svgSourceDir: string;
    outputPath: string;
    fontName: string;
    fontHeight: number;
    ascent: number;
    descent: number;
}

const config: Config = {
    symbolsFilePath: './symbols.txt',
    svgSourceDir: './node_modules/@material-symbols/svg-400/outlined',
    outputPath: './font-output',
    fontName: 'IconFont',
    fontHeight: 960,
    ascent: 0,
    descent: 0
};

// Ensure output directory exists
if (!fs.existsSync(config.outputPath)) {
    fs.mkdirSync(config.outputPath, { recursive: true });
}

// Read the list of icon names from symbols.txt


// Convert SVGs to SVG font
async function convertSvgsToSvgFont(symbols: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        // Create a writable stream for the SVG font
        const fontStream = new SVGIcons2SVGFontStream({
            fontName: config.fontName,
            normalize: true,
            centerHorizontally: true,
            centerVertically: true

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
            const svgPath = path.join(config.svgSourceDir, `${symbolName}.svg`);

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

// Convert SVG font to TTF font
function convertSvgFontToTtf(svgFont: string): Buffer {
    const ttf = svg2ttf(svgFont, {});
    return Buffer.from(ttf.buffer);
}

// Save font files
function saveFontFiles(svgFont: string, ttfBuffer: Buffer): void {
    const svgFontPath = path.join(config.outputPath, `${config.fontName}.svg`);
    const ttfFontPath = path.join(config.outputPath, `${config.fontName}.ttf`);

    fs.writeFileSync(svgFontPath, svgFont);
    fs.writeFileSync(ttfFontPath, ttfBuffer);

    console.log(`✅ Font files saved to ${config.outputPath}`);
    console.log(`SVG Font: ${svgFontPath}`);
    console.log(`TTF Font: ${ttfFontPath}`);
}

// Generate CSS file with font-face definition
function generateCssFile(symbols: string[]): void {
    const cssPath = path.join(config.outputPath, `${config.fontName}.css`);

    let css = `@font-face {
  font-family: '${config.fontName}';
  src: url('./${config.fontName}.ttf') format('truetype'),
       url('./${config.fontName}.svg#${config.fontName}') format('svg');
  font-weight: normal;
  font-style: normal;
}

.icon {
  font-family: '${config.fontName}';
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

`;

    // Add classes for each icon
    symbols.forEach(symbolName => {
        css += `.icon-${symbolName}:before {
  content: "${symbolName}";
}

`;
    });

    fs.writeFileSync(cssPath, css);
    console.log(`CSS file generated: ${cssPath}`);
}

// Main function to run the conversion process
async function main() {
    try {
        console.log('📖 Reading symbols list...');
        const symbols = readSymbolsList();

        if (symbols.length === 0) {
            console.error('❌ No symbols found in the symbols file. Exiting.');
            return;
        }

        console.log(`🔍 Found ${symbols.length} symbols: ${symbols.join(', ')}`);

        console.log('🔄 Converting SVGs to SVG font...');
        const svgFont = await convertSvgsToSvgFont(symbols);

        console.log('🔄 Converting SVG font to TTF...');
        const ttfBuffer = convertSvgFontToTtf(svgFont);

        console.log('💾 Saving font files...');
        saveFontFiles(svgFont, ttfBuffer);

        console.log('📝 Generating CSS file...');
        generateCssFile(symbols);

        console.log('✨ Font generation completed successfully!');
    } catch (error) {
        console.error(`❌ Error generating font: ${error}`);
    }
}

// Run the script
main();