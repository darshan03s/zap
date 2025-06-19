export function parseZapArtifact(zapArtifactText: string): {
    fileObject: Record<string, string>;
    projectName: string;
    commandsArr: string[];
    infoContent: string;
} {
    const fileObject: Record<string, string> = {};
    const commandsArr: string[] = [];
    let projectName = "";
    let infoContent = "";

    // Extract title from zapArtifact element
    const titleRegex = /<zapArtifact[^>]+title="([^"]+)"/;
    const titleMatch = zapArtifactText.match(titleRegex);
    if (titleMatch) {
        projectName = titleMatch[1];
    }

    const infoRegex = /<info>([\s\S]*?)<\/info>/;
    const infoMatch = zapArtifactText.match(infoRegex);
    if (infoMatch) {
        infoContent = infoMatch[1].trim();
    }

    // Extract file actions
    const fileActionRegex =
        /<zapAction\s+type="file"\s+filePath="([^"]+)">[\s\S]*?<\/zapAction>/g;
    let match;
    while ((match = fileActionRegex.exec(zapArtifactText)) !== null) {
        const filePath = match[1];
        const fullMatch = match[0];

        const contentStart = fullMatch.indexOf(">") + 1;
        const contentEnd = fullMatch.lastIndexOf("</zapAction>");
        const content = fullMatch.substring(contentStart, contentEnd).trim();

        fileObject[filePath] = content;
    }

    // Extract shell commands
    const shellActionRegex = /<zapAction\s+type="shell">[\s\S]*?<\/zapAction>/g;
    let shellMatch;
    while ((shellMatch = shellActionRegex.exec(zapArtifactText)) !== null) {
        const fullMatch = shellMatch[0];

        const contentStart = fullMatch.indexOf(">") + 1;
        const contentEnd = fullMatch.lastIndexOf("</zapAction>");
        const command = fullMatch.substring(contentStart, contentEnd).trim();

        if (command) {
            commandsArr.push(command);
        }
    }

    return { fileObject, projectName, commandsArr, infoContent };
}
