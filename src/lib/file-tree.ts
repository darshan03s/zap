import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_IGNORED_ENTRIES = new Set(['node_modules', '.git', '.next', 'dist'])

export type FileTreeOptions = {
  ignore?: string[]
}

async function buildTreeLines(
  absolutePath: string,
  prefix: string,
  lines: string[],
  ignoredEntries: Set<string>
): Promise<void> {
  const entries = (await fs.readdir(absolutePath, { withFileTypes: true }))
    .filter((entry) => !ignoredEntries.has(entry.name))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) {
        return a.isDirectory() ? -1 : 1
      }

      return a.name.localeCompare(b.name)
    })

  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]
    const isLast = index === entries.length - 1
    const connector = isLast ? '└── ' : '├── '
    const childPrefix = isLast ? '    ' : '│   '
    const suffix = entry.isDirectory() ? '/' : ''

    lines.push(`${prefix}${connector}${entry.name}${suffix}`)

    if (entry.isDirectory()) {
      await buildTreeLines(
        path.join(absolutePath, entry.name),
        `${prefix}${childPrefix}`,
        lines,
        ignoredEntries
      )
    }
  }
}

export async function formatFileTree(
  folderPath: string,
  options: FileTreeOptions = {}
): Promise<string> {
  const absolutePath = path.resolve(folderPath)
  const ignoredEntries = new Set(options.ignore ?? [...DEFAULT_IGNORED_ENTRIES])
  const rootName = path.basename(absolutePath)
  const lines = [`${rootName}/`]

  await buildTreeLines(absolutePath, '', lines, ignoredEntries)

  return lines.join('\n')
}

export async function printFileTree(
  folderPath: string,
  options: FileTreeOptions = {}
): Promise<string> {
  const tree = await formatFileTree(folderPath, options)

  console.log(tree)

  return tree
}

function printUsage() {
  console.log(`Usage: pnpm file-tree [folder] [--ignore entry1,entry2]

Print an ASCII file tree for the given folder.

Arguments:
  folder              Folder path (default: .)

Options:
  --ignore, -i        Comma-separated entries to ignore (replaces defaults)
  --help, -h          Show this help message`)
}

function parseCliArgs(argv: string[]) {
  let folderPath = '.'
  let ignore: string[] | undefined

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]

    if (arg === '--help' || arg === '-h') {
      return { help: true as const }
    }

    if (arg === '--ignore' || arg === '-i') {
      const value = argv[index + 1]

      if (!value) {
        throw new Error('Missing value for --ignore')
      }

      ignore = value.split(',').map((entry) => entry.trim()).filter(Boolean)
      index++
      continue
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`)
    }

    folderPath = arg
  }

  return { folderPath, ignore }
}

async function runCli() {
  try {
    const args = parseCliArgs(process.argv.slice(2))

    if ('help' in args) {
      printUsage()
      return
    }

    await printFileTree(args.folderPath, { ignore: args.ignore })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to print file tree'

    console.error(message)
    process.exitCode = 1
  }
}

const isMainModule =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isMainModule) {
  void runCli()
}
