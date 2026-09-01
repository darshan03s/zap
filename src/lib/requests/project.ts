import z from 'zod'
import { api } from '../api'

export type Project = {
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}

export const CreateProjectRequest = z.object({
  text: z.string().min(1)
})

export async function getProjects() {
  const { data } = await api.get<{ projects: Project[] }>('/projects')
  return data.projects
}

export async function createProject(params: { text: string }) {
  const { data } = await api.post<{ project: Project }>('/projects', params)
  return data.project
}
