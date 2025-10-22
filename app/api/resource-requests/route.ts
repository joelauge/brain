import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const resourceRequests = await prisma.resourceRequest.findMany({
      include: {
        project: true,
        step: true
      },
      orderBy: {
        requestedAt: 'desc'
      }
    })
    return NextResponse.json(resourceRequests)
  } catch (error) {
    console.error('Error fetching resource requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, stepId, title, description, amount, requestedBy } = body

    const resourceRequest = await prisma.resourceRequest.create({
      data: {
        projectId,
        stepId,
        title,
        description,
        amount: Math.round(amount * 100), // Convert to cents
        requestedBy: requestedBy || 'admin'
      },
      include: {
        project: true,
        step: true
      }
    })

    return NextResponse.json(resourceRequest)
  } catch (error) {
    console.error('Error creating resource request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    const updateData: any = { status }
    if (status === 'approved') {
      updateData.approvedAt = new Date()
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date()
    }

    const resourceRequest = await prisma.resourceRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        step: true
      }
    })

    return NextResponse.json(resourceRequest)
  } catch (error) {
    console.error('Error updating resource request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
