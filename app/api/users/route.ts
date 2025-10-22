import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clerkId = searchParams.get('clerkId')

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId }
      })
      return NextResponse.json(user)
    } else {
      const users = await prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clerkId, email, firstName, lastName } = body

    // First, try to find user by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId }
    })

    if (user) {
      // User exists, update their information
      user = await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          firstName,
          lastName
        }
      })
    } else {
      // User doesn't exist, check if email is already taken
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUserByEmail) {
        // Email is taken by another user, update that user's clerkId
        user = await prisma.user.update({
          where: { email },
          data: {
            clerkId,
            firstName,
            lastName
          }
        })
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName,
            lastName
          }
        })
      }
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
