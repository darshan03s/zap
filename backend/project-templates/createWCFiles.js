import fs from "fs";
import path from "path";

function createWebContainerFiles(folderPath) {
    const files = {};

    function processPath(currentPath, relativePath = "") {
        const stats = fs.statSync(currentPath);

        if (stats.isDirectory()) {
            const items = fs.readdirSync(currentPath);
            const directory = {};

            for (const item of items) {
                const itemPath = path.join(currentPath, item);
                const result = processPath(
                    itemPath,
                    path.join(relativePath, item)
                );
                if (result) {
                    directory[item] = result;
                }
            }

            return {
                directory: directory,
            };
        } else if (stats.isFile()) {
            const contents = fs.readFileSync(currentPath, "utf-8");
            return {
                file: {
                    contents: contents,
                },
            };
        }

        return null;
    }

    // Process the root directory
    const stats = fs.statSync(folderPath);
    if (stats.isDirectory()) {
        const items = fs.readdirSync(folderPath);

        for (const item of items) {
            const itemPath = path.join(folderPath, item);
            const result = processPath(itemPath);
            if (result) {
                files[item] = result;
            }
        }
    }

    return files;
}

// Get folder path from command line arguments
const folderPath = process.argv[2];

if (!folderPath) {
    console.error("Please provide a folder path as an argument");
    console.error("Usage: node createWCFiles.js <folder-path>");
    process.exit(1);
}

if (!fs.existsSync(folderPath)) {
    console.error(`Folder path does not exist: ${folderPath}`);
    process.exit(1);
}

try {
    const webContainerFiles = createWebContainerFiles(folderPath);
    const filesObj = `export const files = ${JSON.stringify(
        webContainerFiles,
        null,
        2
    )}`;
    console.log(filesObj);
} catch (error) {
    console.error("Error processing folder:", error.message);
    process.exit(1);
}
