import React, { useState, useRef, useCallback, type ReactNode } from 'react'

interface ResizeHandle {
  position: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  enabled: boolean
}

interface ResizablePanelProps {
  children: ReactNode
  initialWidth?: number
  initialHeight?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
  resizeHandles?: ResizeHandle[]
  onResize?: (width: number, height: number) => void
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  initialWidth = 300,
  initialHeight = 200,
  minWidth = 100,
  minHeight = 100,
  maxWidth = Infinity,
  maxHeight = Infinity,
  className = '',
  resizeHandles = [{ position: 'right', enabled: true }],
  onResize
}) => {
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight
  })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 })
  const [startDimensions, setStartDimensions] = useState({ width: 0, height: 0 })

  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeDirection(direction)
    setStartMousePos({ x: e.clientX, y: e.clientY })
    setStartDimensions(dimensions)
  }, [dimensions])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !panelRef.current) return

    const deltaX = e.clientX - startMousePos.x
    const deltaY = e.clientY - startMousePos.y

    let newWidth = startDimensions.width
    let newHeight = startDimensions.height

    // Calculate new dimensions based on resize direction
    if (resizeDirection.includes('right')) {
      newWidth = startDimensions.width + deltaX
    } else if (resizeDirection.includes('left')) {
      newWidth = startDimensions.width - deltaX
    }

    if (resizeDirection.includes('bottom')) {
      newHeight = startDimensions.height + deltaY
    } else if (resizeDirection.includes('top')) {
      newHeight = startDimensions.height - deltaY
    }

    // Apply constraints
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight))

    setDimensions({ width: newWidth, height: newHeight })
    onResize?.(newWidth, newHeight)
  }, [isResizing, resizeDirection, startMousePos, startDimensions, minWidth, minHeight, maxWidth, maxHeight, onResize])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setResizeDirection('')
  }, [])

  // Add global mouse event listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const getHandleClassName = (position: string) => {
    const baseClasses = "absolute bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors duration-150"
    const activeClasses = isResizing && resizeDirection === position ? "bg-blue-500 bg-opacity-50" : ""

    const positionClasses = {
      'top': 'top-0 left-0 right-0 h-1 cursor-ns-resize',
      'right': 'top-0 right-0 bottom-0 w-1 cursor-ew-resize',
      'bottom': 'bottom-0 left-0 right-0 h-1 cursor-ns-resize',
      'left': 'top-0 left-0 bottom-0 w-1 cursor-ew-resize',
      'top-left': 'top-0 left-0 w-2 h-2 cursor-nw-resize',
      'top-right': 'top-0 right-0 w-2 h-2 cursor-ne-resize',
      'bottom-left': 'bottom-0 left-0 w-2 h-2 cursor-sw-resize',
      'bottom-right': 'bottom-0 right-0 w-2 h-2 cursor-se-resize'
    }

    return `${baseClasses} ${positionClasses[position as keyof typeof positionClasses]} ${activeClasses}`
  }

  return (
    <div
      ref={panelRef}
      className={`relative ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`
      }}
    >
      {children}

      {/* Render resize handles */}
      {resizeHandles.map((handle, index) =>
        handle.enabled && (
          <div
            key={`${handle.position}-${index}`}
            className={getHandleClassName(handle.position)}
            onMouseDown={(e) => handleMouseDown(e, handle.position)}
            title={`Resize from ${handle.position}`}
          />
        )
      )}
    </div>
  )
}

export default ResizablePanel 