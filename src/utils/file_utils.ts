// Function to recursively traverse directories
import fs from "fs";
import path from "path";

export function traverseDirectory(dir: string, fileProcessor: (filePath: string) => void) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            traverseDirectory(filePath, fileProcessor);
        } else if (stat.isFile()) {
            fileProcessor(filePath);
        }
    }
}

export function saveListToTxt(outputPath: string, filename:string, list: string[]) {
    const resolvedOutputPath = path.resolve(outputPath);
    const finalOutputPath = path.extname(resolvedOutputPath) ? resolvedOutputPath : path.join(resolvedOutputPath, filename);
    const directory = path.dirname(finalOutputPath);
    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.info(`📁 Created new directory: ${directory}`);
    }
    fs.writeFileSync(finalOutputPath, list.join('\n'), 'utf-8');
    console.info(`📝 Angular Material icons list saved to: ${finalOutputPath}`);
}