import { files } from "./demo.js";

/**
 * Recursively traverses a directory object and generates XML file elements.
 * @param {object} directoryObject The directory object to process.
 * @param {string} pathPrefix The current path prefix for items in this directory.
 * @returns {string[]} An array of XML strings, each representing a file element.
 */
function createFileElements(directoryObject, pathPrefix) {
    let elements = [];
    for (const name in directoryObject) {
        if (Object.prototype.hasOwnProperty.call(directoryObject, name)) {
            const currentPath = pathPrefix ? `${pathPrefix}/${name}` : name;
            const item = directoryObject[name];

            if (item.file) {
                elements.push(`  <file path="${currentPath}">`);
                elements.push(`    ${item.file.contents}`);
                elements.push(`  </file>`);
            } else if (item.directory) {
                elements = elements.concat(
                    createFileElements(item.directory, currentPath)
                );
            }
        }
    }
    return elements;
}

/**
 * Takes a files object and converts it into an XML string, then prints the result.
 * @param {object} filesObject The files object to convert.
 */
function filesToXmlParser(filesObject) {
    const fileElements = createFileElements(filesObject, "");
    const xmlString = `<files>\n${fileElements.join("\n")}\n</files>`;
    console.log(xmlString);
}

filesToXmlParser(files);

export { filesToXmlParser };
