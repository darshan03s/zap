export const DEFAULT_ROOT_DIR = 'workspace' as const

export const IGNORED_FOLDERS = new Set([
  'node_modules',
  '.venv',
  'out',
  'build',
  'dist',
  '.git',
  '__pycache__',
  '.next'
])

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico']

export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'webm']

export const AUDIO_EXTENSIONS = ['mp3', 'm4a']

export const OTHER_EXTENSIONS = ['pdf']

export const IGNORED_FS_EXTENSIONS_TO_COPY = [
  ...IMAGE_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  ...AUDIO_EXTENSIONS,
  ...OTHER_EXTENSIONS
]

export const IGNORED_FS_EXTENSIONS_TO_DISPLAY = [...OTHER_EXTENSIONS]
