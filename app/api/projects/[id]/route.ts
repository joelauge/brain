import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { projectName, projectDescription, assignedConsultant, quotedAmount } = body

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        projectName,
        projectDescription,
        assignedConsultant,
        quotedAmount,
        updatedAt: new Date()
      },
      include: {
        client: true,
        steps: {
          include: {
            resourceRequests: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        resourceRequests: true
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Delete the project (cascade will handle steps and resource requests)
    await prisma.project.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
