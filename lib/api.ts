// Client-side API service for making HTTP requests to our API routes

export interface ProjectData {
  id: string
  clientId: string
  projectName: string
  projectDescription: string
  assignedConsultant: string
  quotedAmount: number
  totalProgress: number
  paymentStatus: string
  projectStatus: string
  finalClientSignOff: boolean
  finalConsultantSignOff: boolean
  finalPaymentRequired: boolean
  completionDate?: string
  createdAt: string
  updatedAt: string
  client: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  steps: ProjectStepData[]
  resourceRequests: ResourceRequestData[]
}

export interface ProjectStepData {
  id: string
  projectId: string
  title: string
  text: string
  date: string
  status: string
  clientNotes: string
  consultantNotes: string
  clientSignOff: boolean
  consultantSignOff: boolean
  completedDate?: string
  createdAt: string
  updatedAt: string
  resourceRequests: ResourceRequestData[]
}

export interface ResourceRequestData {
  id: string
  projectId?: string
  stepId?: string
  title: string
  description: string
  amount: number
  status: string
  requestedBy: string
  requestedAt: string
  approvedAt?: string
  rejectedAt?: string
}

export interface ProjectRequestData {
  id: string
  clientId: string
  projectTitle: string
  projectDescription: string
  status: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
  client: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export interface UserData {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt: string
  inviteSentAt?: string
  inviteAcceptedAt?: string
  lastInviteSentAt?: string
}

class ApiService {
  private baseUrl = '/api'

  // Users
  async getUserByClerkId(clerkId: string): Promise<UserData | null> {
    const response = await fetch(`${this.baseUrl}/users?clerkId=${clerkId}`)
    if (!response.ok) return null
    return response.json()
  }

  async createUser(data: {
    clerkId: string
    email: string
    firstName?: string
    lastName?: string
  }): Promise<UserData> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to create user:', response.status, errorText)
      throw new Error(`Failed to create user: ${response.status} ${errorText}`)
    }
    return response.json()
  }

  async updateUserInviteStatus(userId: string, data: {
    inviteSentAt?: string
    inviteAcceptedAt?: string
    lastInviteSentAt?: string
  }): Promise<UserData> {
    const response = await fetch(`${this.baseUrl}/users/${userId}/invite-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update invite status')
    return response.json()
  }

  async resendProjectInvite(data: {
    email: string
    firstName: string
    projectName: string
    projectDescription: string
    quotedAmount: number
    assignedConsultant: string
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications/resend-invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to resend invite')
  }

  async getUsers(): Promise<UserData[]> {
    const response = await fetch(`${this.baseUrl}/users`)
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  }

  // Projects
  async getProjects(clientId?: string, adminView = false): Promise<ProjectData[]> {
    const params = new URLSearchParams()
    if (clientId) params.append('clientId', clientId)
    if (adminView) params.append('adminView', 'true')
    
    const response = await fetch(`${this.baseUrl}/projects?${params}`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    return response.json()
  }

  async createProject(data: {
    clientId: string
    projectName: string
    projectDescription: string
    assignedConsultant: string
    quotedAmount: number
    steps: Array<{
      title: string
      text: string
      status?: string
    }>
  }): Promise<ProjectData> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create project')
    return response.json()
  }

  async updateProject(id: string, updates: {
    projectName?: string
    projectDescription?: string
    assignedConsultant?: string
    quotedAmount?: number
  }): Promise<ProjectData> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update project')
    return response.json()
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/projects/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete project')
  }

  // Project Steps
  async updateProjectStep(stepId: string, updates: {
    status?: string
    consultantNotes?: string
    clientNotes?: string
    clientSignOff?: boolean
    consultantSignOff?: boolean
  }): Promise<ProjectStepData> {
    const response = await fetch(`${this.baseUrl}/project-steps`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId, updates })
    })
    if (!response.ok) throw new Error('Failed to update project step')
    return response.json()
  }

  // Project Requests
  async getProjectRequests(): Promise<ProjectRequestData[]> {
    const response = await fetch(`${this.baseUrl}/project-requests`)
    if (!response.ok) throw new Error('Failed to fetch project requests')
    return response.json()
  }

  async createProjectRequest(data: {
    clientId: string
    projectTitle: string
    projectDescription: string
  }): Promise<ProjectRequestData> {
    const response = await fetch(`${this.baseUrl}/project-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create project request')
    return response.json()
  }

  async updateProjectRequest(id: string, updates: {
    status: string
    notes?: string
    reviewedBy?: string
  }): Promise<ProjectRequestData> {
    const response = await fetch(`${this.baseUrl}/project-requests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    })
    if (!response.ok) throw new Error('Failed to update project request')
    return response.json()
  }

  // Resource Requests
  async getResourceRequests(): Promise<ResourceRequestData[]> {
    const response = await fetch(`${this.baseUrl}/resource-requests`)
    if (!response.ok) throw new Error('Failed to fetch resource requests')
    return response.json()
  }

  async createResourceRequest(data: {
    projectId?: string
    stepId?: string
    title: string
    description: string
    amount: number
    requestedBy?: string
  }): Promise<ResourceRequestData> {
    const response = await fetch(`${this.baseUrl}/resource-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create resource request')
    return response.json()
  }

  async updateResourceRequest(id: string, status: string): Promise<ResourceRequestData> {
    const response = await fetch(`${this.baseUrl}/resource-requests`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    if (!response.ok) throw new Error('Failed to update resource request')
    return response.json()
  }

  async updateResourceRequestDetails(id: string, updates: {
    title?: string
    description?: string
    amount?: number
  }): Promise<ResourceRequestData> {
    const response = await fetch(`${this.baseUrl}/resource-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!response.ok) throw new Error('Failed to update resource request details')
    return response.json()
  }

  async deleteResourceRequest(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/resource-requests/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete resource request')
  }

  async sendProjectNotification(data: {
    email: string
    firstName: string
    projectName: string
    projectDescription: string
    quotedAmount: number
    assignedConsultant: string
  }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notifications/send-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to send project notification')
  }
}

export const apiService = new ApiService()
