import fs from "fs";

export default function readSymbolsList(paths: string[]): string[] {
    let symbols: string[] = [];
    paths.forEach((path) => {
        try {
            const content = fs.readFileSync(path, 'utf-8');
            symbols.push(...content
                .split('\n')
                .map((line: string) => line.trim())
                .filter((line: string) => line.length > 0));
        } catch (error) {
            console.error(`Error reading symbols file: ${error}`);
            return [];
        }
    });
    return symbols;
}