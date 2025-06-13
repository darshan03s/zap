import fs from "fs";
import path from "path";

function getAllFiles(dirPath, basePath = "") {
    const files = [];

    try {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativePath = basePath ? path.join(basePath, item) : item;

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Recursively get files from subdirectories
                files.push(...getAllFiles(fullPath, relativePath));
            } else if (stat.isFile()) {
                try {
                    const content = fs.readFileSync(fullPath, "utf8");
                    files.push({
                        path: relativePath.replace(/\\/g, "/"), // Normalize path separators
                        content: content,
                    });
                } catch (error) {
                    console.error(
                        `Warning: Could not read file ${fullPath}: ${error.message}`
                    );
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dirPath}: ${error.message}`);
        process.exit(1);
    }

    return files;
}

function generateXml(files) {
    let xml = "<files>\n";

    for (const file of files) {
        xml += `    <file path="${file.path}">\n`;

        // Split content into lines and add proper indentation
        const lines = file.content.split("\n");
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Add 8 spaces (2 levels of 4-space indentation) before each line
            xml += `        ${line}`;
            // Add newline except for the last line to avoid extra newline
            if (i < lines.length - 1) {
                xml += "\n";
            }
        }

        xml += `\n    </file>\n`;
    }

    xml += "</files>";
    return xml;
}

// ... rest of the code remains the same
function main() {
    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error("Usage: node folder-to-xml.js <folder-path>");
        console.error("Example: node folder-to-xml.js folder1/folder2");
        process.exit(1);
    }

    const folderPath = args[0];

    // Check if the folder exists
    if (!fs.existsSync(folderPath)) {
        console.error(`Error: Folder "${folderPath}" does not exist.`);
        process.exit(1);
    }

    if (!fs.statSync(folderPath).isDirectory()) {
        console.error(`Error: "${folderPath}" is not a directory.`);
        process.exit(1);
    }

    // Get all files from the folder
    const files = getAllFiles(folderPath);

    // Generate and output XML
    const xml = generateXml(files);
    console.log(xml);
}

// Run the script
main();
