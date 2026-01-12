import { CaseFile } from "@/lib/database.types"

export interface CaseFilesFilters {
  search?: string
  category?: string
  court?: string
  year?: string
  isPremium?: boolean
  page?: number
  limit?: number
}

export interface CaseFilesResponse {
  caseFiles: CaseFile[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function fetchCaseFiles(filters: CaseFilesFilters = {}): Promise<CaseFilesResponse> {
  const params = new URLSearchParams()

  if (filters.search) params.append('search', filters.search)
  if (filters.category && filters.category !== 'all') params.append('category', filters.category)
  if (filters.court && filters.court !== 'all') params.append('court', filters.court)
  if (filters.year && filters.year !== 'all') params.append('year', filters.year)
  if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString())
  if (filters.page) params.append('page', filters.page.toString())
  if (filters.limit) params.append('limit', filters.limit.toString())

  const response = await fetch(`/api/case-files?${params.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch case files')
  }

  return response.json()
}

export async function fetchCaseFile(id: string): Promise<CaseFile> {
  const response = await fetch(`/api/case-files/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch case file')
  }

  const data = await response.json()
  return data.caseFile
}