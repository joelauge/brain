import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const projectRequests = await prisma.projectRequest.findMany({
      include: {
        client: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(projectRequests)
  } catch (error) {
    console.error('Error fetching project requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, projectTitle, projectDescription } = body

    const projectRequest = await prisma.projectRequest.create({
      data: {
        clientId,
        projectTitle,
        projectDescription
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(projectRequest)
  } catch (error) {
    console.error('Error creating project request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, reviewedBy } = body

    const projectRequest = await prisma.projectRequest.update({
      where: { id },
      data: {
        status,
        notes,
        reviewedBy,
        reviewedAt: new Date()
      },
      include: {
        client: true
      }
    })

    return NextResponse.json(projectRequest)
  } catch (error) {
    console.error('Error updating project request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
