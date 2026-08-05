import { Dispatch, SetStateAction } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

export const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  showCloseButton,
  disablePointerDismissal
}: {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  title: string
  description: string
  children: React.ReactNode
  showCloseButton?: boolean
  disablePointerDismissal?: boolean
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={disablePointerDismissal}
    >
      <DialogContent showCloseButton={showCloseButton}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
