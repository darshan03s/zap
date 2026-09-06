import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_TEMPLATE_DIR = path.join(process.cwd(), 'base-template')

const IGNORED_ENTRIES = new Set(['node_modules', 'dist'])

export type BaseTemplateFile = {
  name: string
  path: string
  type: 'file' | 'directory'
  content: string | null
  parentPath: string | null
}

async function walkDirectory(
  absoluteDir: string,
  relativePath = ''
): Promise<BaseTemplateFile[]> {
  const entries: BaseTemplateFile[] = []
  const dirEntries = await fs.readdir(absoluteDir, { withFileTypes: true })

  for (const entry of dirEntries) {
    if (IGNORED_ENTRIES.has(entry.name)) {
      continue
    }

    const entryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name
    const parentPath = relativePath || null

    if (entry.isDirectory()) {
      entries.push({
        name: entry.name,
        path: entryPath,
        type: 'directory',
        content: null,
        parentPath
      })

      entries.push(...(await walkDirectory(path.join(absoluteDir, entry.name), entryPath)))
      continue
    }

    if (entry.isFile()) {
      const content = await fs.readFile(path.join(absoluteDir, entry.name), 'utf-8')

      entries.push({
        name: entry.name,
        path: entryPath,
        type: 'file',
        content,
        parentPath
      })
    }
  }

  return entries
}

export async function readBaseTemplateFiles() {
  const entries = await walkDirectory(BASE_TEMPLATE_DIR)

  return entries
}
