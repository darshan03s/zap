export function mapExtToLanguage(ext: string): string {
    switch (ext) {
        case "js":
            return "javascript";
        case "jsx":
            return "javascript";
        case "ts":
            return "typescript";
        case "tsx":
            return "typescript";
        case "py":
            return "python";
        case "html":
            return "html";
        case "css":
            return "css";
        case "json":
            return "json";
        case "md":
            return "markdown";
        case "txt":
            return "plaintext";
        case "svg":
            return "xml";
        default:
            return "plaintext";
    }
}
