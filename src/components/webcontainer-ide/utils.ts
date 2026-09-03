export function getExtension(path: string) {
  const fileName = path.split('/').pop() ?? ''
  return fileName.includes('.') ? (fileName.split('.').pop()?.toLowerCase() ?? '') : ''
}

export function getParentFolder(path: string): string {
  const normalized = path.replace(/\/+$/, '')

  const lastSlash = normalized.lastIndexOf('/')

  if (lastSlash <= 0) {
    return '/'
  }

  return normalized.slice(0, lastSlash)
}
