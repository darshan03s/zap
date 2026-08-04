import { ImageResponse } from 'takumi-js/response'
import OgImage from '../og-image'

export function GET() {
  return new ImageResponse(<OgImage />, {
    width: 1200,
    height: 628
  })
}
