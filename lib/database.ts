import { prisma } from '@/lib/prisma'

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

// Database service functions
export class DatabaseService {
  // Projects
  static async getProjects(clientId?: string, adminView = false): Promise<ProjectData[]> {
    const projects = await prisma.project.findMany({
      where: clientId && !adminView ? { clientId } : undefined,
      include: {
        client: true,
        steps: {
          include: {
            resourceRequests: true
          }
        },
        resourceRequests: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return projects.map(project => ({
      ...project,
      quotedAmount: project.quotedAmount / 100, // Convert from cents
      completionDate: project.completionDate?.toISOString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      client: {
        ...project.client,
        firstName: project.client.firstName || undefined,
        lastName: project.client.lastName || undefined
      },
      steps: project.steps.map(step => ({
        ...step,
        completedDate: step.completedDate?.toISOString(),
        createdAt: step.createdAt.toISOString(),
        updatedAt: step.updatedAt.toISOString(),
        resourceRequests: step.resourceRequests.map(req => ({
          ...req,
          projectId: req.projectId || undefined,
          stepId: req.stepId || undefined,
          amount: req.amount / 100, // Convert from cents
          requestedAt: req.requestedAt.toISOString(),
          approvedAt: req.approvedAt?.toISOString(),
          rejectedAt: req.rejectedAt?.toISOString()
        }))
      })),
      resourceRequests: project.resourceRequests.map(req => ({
        ...req,
        projectId: req.projectId || undefined,
        stepId: req.stepId || undefined,
        amount: req.amount / 100, // Convert from cents
        requestedAt: req.requestedAt.toISOString(),
        approvedAt: req.approvedAt?.toISOString(),
        rejectedAt: req.rejectedAt?.toISOString()
      }))
    }))
  }

  static async createProject(data: {
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
    const project = await prisma.project.create({
      data: {
        clientId: data.clientId,
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        assignedConsultant: data.assignedConsultant,
        quotedAmount: Math.round(data.quotedAmount * 100), // Convert to cents
        steps: {
          create: data.steps.map((step, index) => ({
            title: step.title,
            text: step.text,
            date: `Step ${index + 1}`,
            status: step.status || 'pending'
          }))
        }
      },
      include: {
        client: true,
        steps: {
          include: {
            resourceRequests: true
          }
        },
        resourceRequests: true
      }
    })

    return {
      ...project,
      quotedAmount: project.quotedAmount / 100,
      completionDate: project.completionDate?.toISOString(),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      client: {
        ...project.client,
        firstName: project.client.firstName || undefined,
        lastName: project.client.lastName || undefined
      },
      steps: project.steps.map(step => ({
        ...step,
        completedDate: step.completedDate?.toISOString(),
        createdAt: step.createdAt.toISOString(),
        updatedAt: step.updatedAt.toISOString(),
        resourceRequests: step.resourceRequests.map(req => ({
          ...req,
          projectId: req.projectId || undefined,
          stepId: req.stepId || undefined,
          amount: req.amount / 100,
          requestedAt: req.requestedAt.toISOString(),
          approvedAt: req.approvedAt?.toISOString(),
          rejectedAt: req.rejectedAt?.toISOString()
        }))
      })),
      resourceRequests: project.resourceRequests.map(req => ({
        ...req,
        projectId: req.projectId || undefined,
        stepId: req.stepId || undefined,
        amount: req.amount / 100,
        requestedAt: req.requestedAt.toISOString(),
        approvedAt: req.approvedAt?.toISOString(),
        rejectedAt: req.rejectedAt?.toISOString()
      }))
    }
  }

  // Project Steps
  static async updateProjectStep(stepId: string, updates: {
    status?: string
    consultantNotes?: string
    clientNotes?: string
    clientSignOff?: boolean
    consultantSignOff?: boolean
  }): Promise<ProjectStepData> {
    const updateData: any = {}
    
    if (updates.status) {
      updateData.status = updates.status
      if (updates.status === 'done') {
        updateData.completedDate = new Date()
      }
    }
    
    if (updates.consultantNotes !== undefined) {
      updateData.consultantNotes = updates.consultantNotes
    }
    
    if (updates.clientNotes !== undefined) {
      updateData.clientNotes = updates.clientNotes
    }
    
    if (updates.clientSignOff !== undefined) {
      updateData.clientSignOff = updates.clientSignOff
    }
    
    if (updates.consultantSignOff !== undefined) {
      updateData.consultantSignOff = updates.consultantSignOff
    }

    const step = await prisma.projectStep.update({
      where: { id: stepId },
      data: updateData,
      include: {
        resourceRequests: true
      }
    })

    // Recalculate project progress
    const project = await prisma.project.findUnique({
      where: { id: step.projectId },
      include: { steps: true }
    })

    if (project) {
      const completedSteps = project.steps.filter(s => s.status === 'done').length
      const totalProgress = Math.round((completedSteps / project.steps.length) * 100)
      
      await prisma.project.update({
        where: { id: step.projectId },
        data: { totalProgress }
      })
    }

    return {
      ...step,
      completedDate: step.completedDate?.toISOString(),
      createdAt: step.createdAt.toISOString(),
      updatedAt: step.updatedAt.toISOString(),
      resourceRequests: step.resourceRequests.map(req => ({
        ...req,
        projectId: req.projectId || undefined,
        stepId: req.stepId || undefined,
        amount: req.amount / 100,
        requestedAt: req.requestedAt.toISOString(),
        approvedAt: req.approvedAt?.toISOString(),
        rejectedAt: req.rejectedAt?.toISOString()
      }))
    }
  }

  // Project Requests
  static async getProjectRequests(): Promise<ProjectRequestData[]> {
    const requests = await prisma.projectRequest.findMany({
      include: {
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return requests.map(request => ({
      ...request,
      reviewedAt: request.reviewedAt?.toISOString(),
      reviewedBy: request.reviewedBy || undefined,
      notes: request.notes || undefined,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      client: {
        ...request.client,
        firstName: request.client.firstName || undefined,
        lastName: request.client.lastName || undefined
      }
    }))
  }

  static async createProjectRequest(data: {
    clientId: string
    projectTitle: string
    projectDescription: string
  }): Promise<ProjectRequestData> {
    const request = await prisma.projectRequest.create({
      data,
      include: {
        client: true
      }
    })

    return {
      ...request,
      reviewedAt: request.reviewedAt?.toISOString(),
      reviewedBy: request.reviewedBy || undefined,
      notes: request.notes || undefined,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      client: {
        ...request.client,
        firstName: request.client.firstName || undefined,
        lastName: request.client.lastName || undefined
      }
    }
  }

  static async updateProjectRequest(id: string, updates: {
    status: string
    notes?: string
    reviewedBy?: string
  }): Promise<ProjectRequestData> {
    const request = await prisma.projectRequest.update({
      where: { id },
      data: {
        ...updates,
        reviewedAt: new Date()
      },
      include: {
        client: true
      }
    })

    return {
      ...request,
      reviewedAt: request.reviewedAt?.toISOString(),
      reviewedBy: request.reviewedBy || undefined,
      notes: request.notes || undefined,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      client: {
        ...request.client,
        firstName: request.client.firstName || undefined,
        lastName: request.client.lastName || undefined
      }
    }
  }

  // Resource Requests
  static async getResourceRequests(): Promise<ResourceRequestData[]> {
    const requests = await prisma.resourceRequest.findMany({
      include: {
        project: true,
        step: true
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return requests.map(request => ({
      ...request,
      projectId: request.projectId || undefined,
      stepId: request.stepId || undefined,
      amount: request.amount / 100,
      requestedAt: request.requestedAt.toISOString(),
      approvedAt: request.approvedAt?.toISOString(),
      rejectedAt: request.rejectedAt?.toISOString()
    }))
  }

  static async createResourceRequest(data: {
    projectId?: string
    stepId?: string
    title: string
    description: string
    amount: number
    requestedBy?: string
  }): Promise<ResourceRequestData> {
    const request = await prisma.resourceRequest.create({
      data: {
        ...data,
        amount: Math.round(data.amount * 100), // Convert to cents
        requestedBy: data.requestedBy || 'admin'
      },
      include: {
        project: true,
        step: true
      }
    })

    return {
      ...request,
      projectId: request.projectId || undefined,
      stepId: request.stepId || undefined,
      amount: request.amount / 100,
      requestedAt: request.requestedAt.toISOString(),
      approvedAt: request.approvedAt?.toISOString(),
      rejectedAt: request.rejectedAt?.toISOString()
    }
  }

  static async updateResourceRequest(id: string, status: string): Promise<ResourceRequestData> {
    const updateData: any = { status }
    if (status === 'approved') {
      updateData.approvedAt = new Date()
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date()
    }

    const request = await prisma.resourceRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        step: true
      }
    })

    return {
      ...request,
      projectId: request.projectId || undefined,
      stepId: request.stepId || undefined,
      amount: request.amount / 100,
      requestedAt: request.requestedAt.toISOString(),
      approvedAt: request.approvedAt?.toISOString(),
      rejectedAt: request.rejectedAt?.toISOString()
    }
  }

  // Users
  static async getUserByClerkId(clerkId: string) {
    return await prisma.user.findUnique({
      where: { clerkId }
    })
  }

  static async createUser(data: {
    clerkId: string
    email: string
    firstName?: string
    lastName?: string
  }) {
    return await prisma.user.create({
      data
    })
  }

  static async getUsers() {
    return await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}
