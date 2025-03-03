import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';
import fs from 'fs';

export function convertSvgToTtf(buf : Buffer) : Uint8Array {
    return svg2ttf(buf.toString()).buffer;
}

export function convertTtf2Woff(arr : Uint8Array) : Buffer {
    return ttf2woff(arr);
}

export function convertTtf2Woff2(buf : Buffer) : Buffer {
    return ttf2woff2(buf);
}

export function createFontFiles(name: string, buffer: Buffer, outPath = '.', ttf = true, woff= true, woff2 = true){
    const ttfPath = `${outPath}/${name}.ttf`;
    const woffPath = `${outPath}/${name}.woff`;
    const woff2Path = `${outPath}/${name}.woff2`;

    const ttfBuffer = convertSvgToTtf(buffer);
    const woffBuffer = convertTtf2Woff(ttfBuffer);
    const woff2Buffer = convertTtf2Woff2(Buffer.from(ttfBuffer));

    if(ttf){
        fs.writeFileSync(ttfPath, ttfBuffer);
        console.info(`📝 TTF font saved to: ${ttfPath}`);
    }

    if(woff){
        fs.writeFileSync(woffPath, woffBuffer);
        console.info(`📝 WOFF font saved to: ${woffPath}`);
    }

    if(woff2){
        fs.writeFileSync(woff2Path, woff2Buffer);
        console.info(`📝 WOFF2 font saved to: ${woff2Path}`);
    }

}