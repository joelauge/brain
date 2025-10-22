import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const adminView = searchParams.get('adminView') === 'true'

    if (adminView) {
      // Admin view - get all projects
      const projects = await prisma.project.findMany({
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
      return NextResponse.json(projects)
    } else if (clientId) {
      // Client view - get projects for specific client
      const projects = await prisma.project.findMany({
        where: {
          clientId
        },
        include: {
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
      return NextResponse.json(projects)
    } else {
      return NextResponse.json({ error: 'Missing clientId or adminView parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, projectName, projectDescription, assignedConsultant, quotedAmount, steps } = body

    const project = await prisma.project.create({
      data: {
        clientId,
        projectName,
        projectDescription,
        assignedConsultant,
        quotedAmount, // Already in cents from frontend
        steps: {
          create: steps.map((step: any, index: number) => ({
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
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
