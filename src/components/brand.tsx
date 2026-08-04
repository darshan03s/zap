import Link from 'next/link'
import { APP_NAME } from '@/metadata'

export const Brand = () => {
  return <Link href={'/'}>{APP_NAME}</Link>
}
