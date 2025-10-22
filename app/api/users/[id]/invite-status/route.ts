import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { inviteSentAt, inviteAcceptedAt, lastInviteSentAt } = body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        inviteSentAt: inviteSentAt ? new Date(inviteSentAt) : undefined,
        inviteAcceptedAt: inviteAcceptedAt ? new Date(inviteAcceptedAt) : undefined,
        lastInviteSentAt: lastInviteSentAt ? new Date(lastInviteSentAt) : undefined,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error(`Error updating invite status for user ${id}:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
