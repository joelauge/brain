import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { stepId, updates } = body

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
        project: true,
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

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error updating project step:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
