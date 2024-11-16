import {promises as fs} from 'fs';
import * as wawoff2 from 'wawoff2';
import {Font} from 'fonteditor-core';


/**
 * Converts a WOFF2 font file to TTF format
 * @param {string} inputPath - Path to the input WOFF2 file
 * @param {string} outputPath - Path where the TTF file should be saved
 * @returns {Promise<Buffer>} - The TTF buffer
 */
export async function convertWoff2ToTtf(inputPath: string, outputPath: string = ""): Promise<Uint8Array> {
    try {

        // Read the WOFF2 file
        const woff2Buffer = await fs.readFile(inputPath);

        // Convert WOFF2 to TTF
        const ttfBuffer = await wawoff2.decompress(woff2Buffer);

        // Save the TTF file if outputPath is provided
        if (outputPath) {
            await fs.writeFile(outputPath, ttfBuffer);
        }

        return ttfBuffer;

    } catch (error: any) {
        throw new Error(`WOFF2 to TTF conversion failed: ${error.message}`);
    }
}

/**
 * Creates a subset of a font from a TTF buffer
 * @param {Buffer} ttfBuffer - The TTF font buffer
 * @param {string[]} glyphsToKeep - Array of glyph names to include in subset
 * @param {outputPath} outputPath
 * @returns {Promise<Buffer>} - The subsetted TTF buffer
 */
export async function createFontSubset(ttfBuffer: Uint8Array, glyphsToKeep: string[] | Set<string>, outputPath: string): Promise<Buffer> {
    glyphsToKeep = new Set(glyphsToKeep);
    try {
        // Convert Buffer to ArrayBuffer
        const arrayBuffer = ttfBuffer.buffer.slice(
            ttfBuffer.byteOffset,
            ttfBuffer.byteOffset + ttfBuffer.byteLength
        );

        // First, let's read the original font and check its glyphs
        const originalFont = Font.create(arrayBuffer, {
            type: 'ttf'
        });

        const originalFontData = originalFont.get();
        console.log('Original font glyphs:', originalFontData.glyf.length);

        // Create an array of unicode values for the glyphs we want to keep
        let unicodes: any = [];
        originalFontData.glyf.forEach((glyph, index) => {
            if (glyphsToKeep.has(glyph.name)) {
                unicodes = unicodes.concat(glyph.unicode)
            }
        });

        // Create new font with subset
        const subsetFont = Font.create(arrayBuffer, {
            type: 'ttf',
            hinting: true,
            subset: unicodes, // Use unicode values for subsetting
            compound2simple: true, // Convert compound glyphs to simple ones
        });

        // Write the subsetted font
        const subsettedArrayBuffer = subsetFont.write({
            type: 'ttf',
            hinting: true
        }) as ArrayBuffer;

        // Convert back to Buffer
        const subsettedTtfBuffer = Buffer.from(subsettedArrayBuffer);

        // Verify the subset
        const verificationFont = Font.create(subsettedArrayBuffer, {
            type: 'ttf'
        });
        const verificationData = verificationFont.get();

        // Log detailed information
        console.log('Subsetting Results:');
        console.log('Original glyph count:', originalFontData.glyf.length);
        console.log('Requested glyphs:', glyphsToKeep);
        console.log('Resulting glyph count:', verificationData.glyf.length);
        console.log('Size reduction:', {
            original: ttfBuffer.length,
            subsetted: subsettedTtfBuffer.length,
            percentage: Math.round((1 - subsettedTtfBuffer.length / ttfBuffer.length) * 100) + '%'
        });

        // Save the TTF file if outputPath is provided
        if (outputPath) {
            await fs.writeFile(outputPath, subsettedTtfBuffer);
        }
        return subsettedTtfBuffer;

    } catch (error: any) {
        throw new Error(`Font subsetting failed: ${error.message}`);
    }
}

/**
 * Converts a TTF buffer to WOFF2 format and saves it to a file
 * @param {Buffer} ttfBuffer - The TTF font buffer
 * @param {string} outputPath - Path where the WOFF2 file should be saved
 * @returns {Promise<Uint8Array>} - The WOFF2 buffer
 */
export async function convertTtfToWoff2(ttfBuffer: Buffer, outputPath: string): Promise<Uint8Array> {
    try {
        // Convert TTF to WOFF2
        const woff2Buffer = await wawoff2.compress(ttfBuffer);

        // Save the WOFF2 file
        await fs.writeFile(outputPath, woff2Buffer);

        return woff2Buffer;
    } catch (error: any) {
        throw new Error(`TTF to WOFF2 conversion failed: ${error.message}`);
    }
}