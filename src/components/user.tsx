'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogIn, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

export const User = () => {
  const { data, isPending } = authClient.useSession()
  const router = useRouter()

  async function signIn() {
    await authClient.signIn.social({
      provider: 'google'
    })
  }

  async function signOut() {
    await authClient.signOut()
    router.push('/')
  }

  return (
    <div className="flex items-center">
      {isPending && !data && (
        <Button
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
            'animate-pulse rounded-full bg-muted'
          )}
        />
      )}
      {!isPending && !data && (
        <Button
          onClick={signIn}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'text-xs [&_svg]:size-3! flex items-center gap-2'
          )}
        >
          <LogIn />
          Sign in
        </Button>
      )}
      {!isPending && data && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
              'rounded-full overflow-clip'
            )}
          >
            <Image alt="profile-image" width={100} height={100} src={data?.user.image as string} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className={'[&_div]:cursor-pointer'}>
            <DropdownMenuItem onClick={signOut}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
