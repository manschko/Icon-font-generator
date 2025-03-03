export function isUrl(path: string): boolean {
    const urlPattern = /^(http|https):\/\/[^ "]+$/;
    return urlPattern.test(path);
}