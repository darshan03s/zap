import { api } from '../api'

export type Project = {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export async function getProjects() {
  const { data } = await api.get<{ projects: Project[] }>('/projects')
  return data.projects
}
