'use client'

import { useQuery } from '@tanstack/react-query'
import { Folder } from 'lucide-react'
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { getProjects } from '@/lib/requests/project'

export const ProjectsList = () => {
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
    <ItemGroup className="p-2">
      {projects.map((project) => (
        <Item key={project.id} size="sm">
          <ItemMedia variant="icon">
            <Folder />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{project.title}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}
