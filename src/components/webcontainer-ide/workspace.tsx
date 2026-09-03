'use client'

import { useEffect, useState } from 'react'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { sass } from '@codemirror/lang-sass'
import CodeMirror from '@uiw/react-codemirror'
import { Check, Copy, File, Globe, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { ResizablePanel } from '@/components/ui/resizable'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  AUDIO_EXTENSIONS,
  IGNORED_FS_EXTENSIONS_TO_COPY,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS
} from './constants'
import { useIde, useProps, useWebContainer } from './hooks'
import { Terminal } from './terminal'
import { getExtension } from './utils'

const EditorComp = ({ className }: { className?: string }) => {
  const { activeFile, writeFile } = useWebContainer()
  const { editorTheme, editorReadOnly } = useProps()

  const extensions = [
    javascript({ jsx: true }),
    json(),
    html({
      autoCloseTags: true,
      matchClosingTags: true,
      selfClosingTags: true
    }),
    sass(),
    css()
  ]

  const onChange = (val: string) => {
    writeFile(activeFile.path, val)
  }

  return (
    <div className={cn('ide-workspace-editor-comp no-scrollbar flex-1 overflow-scroll', className)}>
      <CodeMirror
        onChange={onChange}
        value={activeFile.content}
        extensions={extensions}
        theme={editorTheme}
        editable={!editorReadOnly}
        className="ide-workspace-editor-codemirror [&_.cm-scroller]:no-scrollbar h-full text-sm [&_.cm-activeLine]:bg-transparent! [&_.cm-activeLineGutter]:bg-transparent! [&_.cm-editor]:h-full!"
      />
    </div>
  )
}

const Loading = () => {
  return (
    <div className={cn('ide-workspace-loading flex flex-1 items-center justify-center')}>
      <Spinner />
    </div>
  )
}

const Displayable = ({
  className,
  path,
  type
}: {
  className?: string
  path: string
  type: 'image' | 'video' | 'audio' | undefined
}) => {
  const { readMedia } = useWebContainer()
  const [url, setUrl] = useState<string | undefined>()

  useEffect(() => {
    let objectUrl: string | undefined

    async function load() {
      objectUrl = await readMedia(path)
      setUrl(objectUrl)
    }

    load()

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [path])

  if (type === 'image') {
    return (
      <div
        className={cn(
          'ide-workspace-displayable flex flex-1 items-center justify-center object-contain p-4',
          className
        )}
      >
        <img src={url} alt={path} />
      </div>
    )
  }

  if (type === 'video') {
    return (
      <div className={cn('flex flex-1 items-center justify-center p-4', className)}>
        <video src={url} controls className="aspect-video w-full rounded-lg border" />
      </div>
    )
  }

  if (type === 'audio') {
    return (
      <div className={cn('flex flex-1 items-center justify-center p-2', className)}>
        <audio src={url} controls className="w-full" />
      </div>
    )
  }
}

const Editor = () => {
  const { activeFile, activePath } = useWebContainer()
  const { view } = useIde()
  const [copied, setCopied] = useState(false)
  const path = activeFile.path
  const ext = getExtension(path)

  function showCopy() {
    if (IGNORED_FS_EXTENSIONS_TO_COPY.includes(ext)) return false
    return true
  }

  function isImage() {
    if (IMAGE_EXTENSIONS.includes(ext)) return true
    return false
  }

  function isVideo() {
    if (VIDEO_EXTENSIONS.includes(ext)) return true
    return false
  }

  function isAudio() {
    if (AUDIO_EXTENSIONS.includes(ext)) return true
    return false
  }

  function isDisplayable() {
    return isImage() || isVideo() || isAudio()
  }

  function handleCopy() {
    navigator.clipboard.writeText(activeFile.content)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const displayableType = (() => {
    if (isImage()) return 'image'
    if (isVideo()) return 'video'
    if (isAudio()) return 'audio'
  })()

  return (
    <>
      <div
        hidden={view === 'preview' || activeFile.path.length === 0}
        className={cn(
          'ide-workspace-editor',
          'editor-header bg-background sticky top-0 left-0 z-10 flex h-(--inner-header-height) min-h-(--inner-header-height) items-center justify-between border-b px-2'
        )}
      >
        <span className="line-clamp-1 text-xs font-semibold">{activeFile.path}</span>
        <ButtonGroup>
          {showCopy() && (
            <Button
              className="ide-workspace-copy-file-content"
              variant={'ghost'}
              size={'icon-xs'}
              title="Copy"
              onClick={handleCopy}
              disabled={copied}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          )}
          <Button
            className="ide-workspace-close-file"
            variant={'ghost'}
            size={'icon-xs'}
            title="Close"
            onClick={() => {
              activePath('')
            }}
          >
            <X />
          </Button>
        </ButtonGroup>
      </div>
      {activeFile.path.length === 0 ? (
        <div
          hidden={view === 'preview'}
          className={cn('flex flex-1 items-center justify-center text-xs')}
        >
          <File className="text-foreground/10 size-20" strokeWidth={1} />
        </div>
      ) : isDisplayable() ? (
        <Displayable
          path={activeFile.path}
          className={view === 'preview' ? 'hidden' : ''}
          type={displayableType}
        />
      ) : (
        <EditorComp className={view === 'preview' ? 'hidden' : ''} />
      )}
    </>
  )
}

const Preview = () => {
  const { serverUrl } = useWebContainer()
  const { view } = useIde()

  return (
    <div hidden={view === 'editor'} className="flex h-full flex-col">
      <div className="flex-1">
        {serverUrl.length > 0 ? (
          <iframe src={serverUrl} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Globe className="text-foreground/10 size-20" strokeWidth={1} />
          </div>
        )}
      </div>
    </div>
  )
}

export const Workspace = () => {
  const { isMounted } = useWebContainer()

  return (
    <ResizablePanel
      style={{ overflow: 'unset' }}
      className="ide-workspace relative flex min-h-0 min-w-0 flex-1 flex-col"
    >
      {isMounted ? (
        <>
          <Editor />
          <Preview />
        </>
      ) : (
        <Loading />
      )}
      <Terminal />
    </ResizablePanel>
  )
}
