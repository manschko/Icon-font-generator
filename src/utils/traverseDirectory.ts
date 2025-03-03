// Function to recursively traverse directories
import fs from "fs";
import path from "path";

export default function traverseDirectory(dir: string, fileProcessor: (filePath: string) => void) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            traverseDirectory(filePath, fileProcessor);
        } else if (stat.isFile() && (filePath.endsWith('.html') || filePath.endsWith('.ts'))) {
            fileProcessor(filePath);
        }
    }
}