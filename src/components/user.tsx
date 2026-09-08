'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Key, LogIn, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { ApiKeyModal } from './api-key-modal'
import { Button, buttonVariants } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

export const User = () => {
  const { data, isPending } = authClient.useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [openApiKeyModal, setOpenApiKeyModal] = useState(false)

  async function signIn() {
    await authClient.signIn.social({
      provider: 'google'
    })
  }

  async function signOut() {
    await authClient.signOut()
    queryClient.removeQueries({ queryKey: ['projects'] })
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
          <DropdownMenuContent className={'[&_div]:cursor-pointer w-fit *:text-xs'}>
            <DropdownMenuGroup className="flex flex-col items-start p-2 text-xs">
              <span>{data.user.name}</span>
              <span className="font-bold">{data.user.email}</span>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="space-y-2 *:text-xs">
              <DropdownMenuItem onClick={() => setOpenApiKeyModal(true)}>
                <Key /> API Key
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <ApiKeyModal
        open={openApiKeyModal}
        onCreateApiKeySuccess={() => setOpenApiKeyModal(false)}
        onOpenChange={setOpenApiKeyModal}
        showCloseButton={true}
        disablePointerDismissal={false}
      />
    </div>
  )
}
