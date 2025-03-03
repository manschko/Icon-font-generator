import * as fs from 'fs';
import * as path from 'path';
import traverseDirectory from "../utils/traverseDirectory";


const defaultFileName = 'AngularMaterialIcons.txt';

export default function analyzeAngularMaterial(paths: string[], outputPath?: string): string[] {
    const iconNamesSet = new Set<string>();
    paths.forEach((path) => {
        console.log(`🔍Analyzing Angular Material icons in: ${path}`);
        traverseDirectory(path, (filePath) => {
            const icons = extractIconNames(filePath);
            icons.forEach(icon => iconNamesSet.add(icon));
        });
    });
    if(outputPath) {
        const resolvedOutputPath = path.resolve(outputPath);
        const finalOutputPath = path.extname(resolvedOutputPath) ? resolvedOutputPath : path.join(resolvedOutputPath, defaultFileName);
        fs.writeFileSync(finalOutputPath, Array.from(iconNamesSet).join('\n'), 'utf-8');
    }

    return Array.from(iconNamesSet);

}


// Function to extract icon names from a file
function extractIconNames(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const iconNames: string[] = [];

    // Regex to match Angular Material icons
    const fontIconRegex = /fontIcon="([^"]+)"/g;
    const matIconTextRegex = /<mat-icon[^>]*>([^<]+)<\/mat-icon>/g;

    let match;

    // Extract fontIcon attribute values
    while ((match = fontIconRegex.exec(content)) !== null) {
        iconNames.push(match[1]);
    }

    // Extract text content within <mat-icon> tags
    while ((match = matIconTextRegex.exec(content)) !== null) {
        iconNames.push(match[1].trim());
    }

    return iconNames;
}
