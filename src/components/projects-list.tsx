'use client'

import { Dispatch, SetStateAction, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ellipsis, Pencil, Trash } from 'lucide-react'
import { Modal } from '@/components/modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Item, ItemActions, ItemContent, ItemGroup } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { Project, deleteProject, getProjects, updateProject } from '@/lib/requests/project'
import { Button } from './ui/button'
import { DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { toast } from './ui/toast'

const ProjectOptions = ({ onRename, onDelete }: { onRename: () => void; onDelete: () => void }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={'p-2 space-y-2 *:text-xs'}>
        <DropdownMenuItem onClick={onRename}>
          <Pencil /> Rename
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const RenameProjectDialog = ({
  project,
  open,
  onOpenChange,
  onSuccess
}: {
  project: Project
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  onSuccess: () => void
}) => {
  const [title, setTitle] = useState(project.title)

  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    }
  })

  async function handleSubmit() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    if (trimmedTitle === project.title) {
      onOpenChange(false)
      return
    }

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        title: trimmedTitle
      })
    } catch {
      toast.add({ type: 'error', description: 'Failed to rename project' })
    }
  }

  return (
    <Modal
      title="Rename project"
      description="Enter a new name for your project"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Input
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            void handleSubmit()
          }
        }}
      />
      <DialogFooter>
        <Button
          onClick={() => void handleSubmit()}
          disabled={updateProjectMutation.isPending || !title.trim()}
        >
          {updateProjectMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </Modal>
  )
}

const DeleteProjectDialog = ({
  project,
  open,
  onOpenChange,
  onSuccess
}: {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) => {
  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      onSuccess()
      onOpenChange(false)
    }
  })

  async function handleDelete() {
    try {
      await deleteProjectMutation.mutateAsync({ id: project.id })
    } catch {
      toast.add({ type: 'error', description: 'Failed to delete project' })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            <p>Are you sure you want to delete:</p>
            <p className="font-bold truncate max-w-xs">&quot;{project.title}&quot;</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleteProjectMutation.isPending}
          >
            {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const ProjectsList = () => {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const queryClient = useQueryClient()
  const [renameProject, setRenameProject] = useState<Project | null>(null)
  const [deleteProjectState, setDeleteProjectState] = useState<Project | null>(null)

  const {
    data: projects,
    isPending,
    isError
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects
  })

  if (isPending) {
    return (
      <ItemGroup className="p-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-lg" />
        ))}
      </ItemGroup>
    )
  }

  if (isError) {
    return (
      <p className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-center h-full">
        Failed to load projects
      </p>
    )
  }

  if (!projects?.length) {
    return (
      <p className="px-4 py-2 text-xs text-muted-foreground flex items-center justify-center h-full">
        No projects yet
      </p>
    )
  }

  return (
    <>
      {renameProject && (
        <RenameProjectDialog
          key={renameProject.id}
          project={renameProject}
          open
          onOpenChange={(open) => {
            const nextOpen = typeof open === 'function' ? open(true) : open
            if (!nextOpen) {
              setRenameProject(null)
            }
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
          }}
        />
      )}
      {deleteProjectState && (
        <DeleteProjectDialog
          key={deleteProjectState.id}
          project={deleteProjectState}
          open
          onOpenChange={(open) => {
            if (!open) {
              setDeleteProjectState(null)
            }
          }}
          onSuccess={() => {
            if (deleteProjectState.id === projectId) {
              router.push('/')
            }
            queryClient.invalidateQueries({ queryKey: ['projects'] })
          }}
        />
      )}
      <ItemGroup className="p-1">
        {projects.map((project) => (
          <Item
            key={project.id}
            size="xs"
            variant={projectId === project.id ? 'muted' : 'default'}
            className="flex-nowrap overflow-hidden p-0 px-2 hover:bg-muted"
          >
            <ItemContent className="min-w-0 overflow-hidden *:text-xs">
              <Link href={`/project/${project.id}`} className="block min-w-0 truncate text-sm">
                {project.title}
              </Link>
            </ItemContent>
            <ItemActions className="shrink-0">
              <ProjectOptions
                onRename={() => setRenameProject(project)}
                onDelete={() => setDeleteProjectState(project)}
              />
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </>
  )
}
