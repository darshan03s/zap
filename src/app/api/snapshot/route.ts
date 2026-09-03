import { NextResponse } from 'next/server'
import { snapshot } from '@webcontainer/snapshot'
import path from 'node:path'

export async function GET() {
  const sourceFolder = path.join(process.cwd(), 'base-template')

  const folderSnapshot = await snapshot(sourceFolder)

  return new NextResponse(new Uint8Array(folderSnapshot), {
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  })
}
