import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { title, description, amount } = body
    const { id } = await params

    const updatedRequest = await prisma.resourceRequest.update({
      where: { id },
      data: {
        title,
        description,
        amount
      }
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Error updating resource request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.resourceRequest.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
