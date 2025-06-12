import { promises as fs } from 'fs';
import path from 'path';

async function readFilesToObject(dirPath) {
  const result = {};

  async function traverse(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile()) {
        const content = await fs.readFile(fullPath, 'utf-8');

        // Get path relative to root directory
        let relativePath = path.relative(dirPath, fullPath);

        // Normalize to forward slashes
        relativePath = relativePath.replace(/\\/g, '/');

        result[relativePath] = content;
      }
    }
  }

  await traverse(dirPath);
  return result;
}

// ---- MAIN FUNCTION ----

async function main() {
  const dirPath = process.argv[2];

  if (!dirPath) {
    console.error('❌ Please provide a folder path.\nUsage: node script.js ./your-folder');
    process.exit(1);
  }

  try {
    const result = await readFilesToObject(dirPath);
    console.log(JSON.stringify(result, null, 2)); // Prettified JSON
  } catch (err) {
    console.error('❌ Error reading folder:', err.message);
    process.exit(1);
  }
}

main();
