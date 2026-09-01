'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Ellipsis } from 'lucide-react'
import { Item, ItemActions, ItemContent, ItemGroup } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'
import { getProjects } from '@/lib/requests/project'
import { Button } from './ui/button'

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
    <ItemGroup className="p-1">
      {projects.map((project) => (
        <Item key={project.id} size="xs" className="flex-nowrap overflow-hidden p-0 px-2">
          <ItemContent className="min-w-0 overflow-hidden">
            <Link
              href={`/project/${project.id}`}
              className="block min-w-0 truncate text-sm"
            >
              {project.title}
            </Link>
          </ItemContent>
          <ItemActions className="shrink-0">
            <Button variant="ghost" size="icon">
              <Ellipsis />
            </Button>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  )
}
