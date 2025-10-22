import { NextRequest, NextResponse } from 'next/server'
import { sendProjectInviteResend } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, projectName, projectDescription, quotedAmount, assignedConsultant } = body

    const success = await sendProjectInviteResend({
      email,
      firstName,
      projectName,
      projectDescription,
      quotedAmount: (quotedAmount / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      }),
      assignedConsultant,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      signupUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?email=${encodeURIComponent(email)}&project=${encodeURIComponent(projectName)}`
    })

    if (success) {
      return NextResponse.json({ success: true, message: 'Invite resent successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to resend invite' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error resending project invite:', error)
    return NextResponse.json({ error: 'Failed to resend invite' }, { status: 500 })
  }
}
