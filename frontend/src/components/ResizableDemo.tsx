import React from 'react'
import ResizablePanel from './ResizablePanel'

const ResizableDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Resizable Panel Demo</h1>
      
      {/* Right resize handle only */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Right Edge Resize (Explorer Style)</h2>
        <ResizablePanel
          initialWidth={300}
          initialHeight={400}
          minWidth={200}
          maxWidth={600}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
          resizeHandles={[{ position: 'right', enabled: true }]}
          onResize={(width, height) => console.log('Panel resized to:', width, height)}
        >
          <div className="p-4 h-full">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">File Explorer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag the right edge to resize horizontally.
              This is perfect for file explorers and sidebars.
            </p>
          </div>
        </ResizablePanel>
      </div>
      
      {/* All corner resize handles */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">All Corner Resize Handles</h2>
        <ResizablePanel
          initialWidth={350}
          initialHeight={250}
          minWidth={200}
          minHeight={150}
          maxWidth={500}
          maxHeight={400}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
          resizeHandles={[
            { position: 'top-left', enabled: true },
            { position: 'top-right', enabled: true },
            { position: 'bottom-left', enabled: true },
            { position: 'bottom-right', enabled: true }
          ]}
        >
          <div className="p-4 h-full">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Corner Resize</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resize from any corner. Perfect for floating panels and modal dialogs.
            </p>
          </div>
        </ResizablePanel>
      </div>
      
      {/* All edges and corners */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">All Edges & Corners</h2>
        <ResizablePanel
          initialWidth={400}
          initialHeight={300}
          minWidth={250}
          minHeight={200}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
          resizeHandles={[
            { position: 'top', enabled: true },
            { position: 'right', enabled: true },
            { position: 'bottom', enabled: true },
            { position: 'left', enabled: true },
            { position: 'top-left', enabled: true },
            { position: 'top-right', enabled: true },
            { position: 'bottom-left', enabled: true },
            { position: 'bottom-right', enabled: true }
          ]}
        >
          <div className="p-4 h-full">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Full Resize Control</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resize from any edge or corner. Perfect for advanced layouts and flexible panels.
            </p>
          </div>
        </ResizablePanel>
      </div>
      
      {/* Terminal style - bottom resize */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Bottom Edge Resize (Terminal Style)</h2>
        <ResizablePanel
          initialWidth={500}
          initialHeight={200}
          minHeight={100}
          maxHeight={400}
          className="bg-black text-green-400 font-mono border border-gray-600 rounded-lg shadow-lg"
          resizeHandles={[{ position: 'bottom', enabled: true }]}
        >
          <div className="p-4 h-full">
            <div className="text-sm">
              <div>$ pwd</div>
              <div>/home/user/project</div>
              <div>$ ls -la</div>
              <div>total 12</div>
              <div>drwxr-xr-x 3 user user 4096 Dec 10 10:30 .</div>
              <div>drwxr-xr-x 5 user user 4096 Dec 10 10:25 ..</div>
              <div>-rw-r--r-- 1 user user  128 Dec 10 10:30 index.html</div>
              <div className="mt-2">
                <span className="text-gray-400">Drag the bottom edge to resize the terminal height.</span>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </div>
    </div>
  )
}

export default ResizableDemo 