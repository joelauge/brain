import { NextRequest, NextResponse } from 'next/server';
import mailchimp from '@mailchimp/mailchimp_marketing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, email } = body;

    // Validate input
    if (!firstName || !email) {
      return NextResponse.json(
        { error: 'First name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if Mailchimp is configured
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_AUDIENCE_ID) {
      console.error('Mailchimp not configured - missing API key or Audience ID');
      console.error('MAILCHIMP_API_KEY:', process.env.MAILCHIMP_API_KEY ? 'Set' : 'Missing');
      console.error('MAILCHIMP_AUDIENCE_ID:', process.env.MAILCHIMP_AUDIENCE_ID ? 'Set' : 'Missing');
      return NextResponse.json(
        { error: 'Newsletter service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Initialize Mailchimp with environment variables
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER_PREFIX || 'us22',
    });

    // Subscribe to Mailchimp
    try {
      const response = await mailchimp.lists.addListMember(
        process.env.MAILCHIMP_AUDIENCE_ID,
        {
          email_address: email,
          status: 'subscribed', // or 'pending' for double opt-in
          merge_fields: {
            FNAME: firstName,
          },
        }
      );

      // Generate MD5 hash of lowercase email for MailChimp subscriber hash
      const crypto = await import('crypto');
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');

      // Add the "news" tag to the member
      try {
        await mailchimp.lists.updateListMemberTags(
          process.env.MAILCHIMP_AUDIENCE_ID,
          subscriberHash,
          {
            tags: [{ name: 'news', status: 'active' }],
          }
        );
        console.log('Successfully added "news" tag to member');
      } catch (tagError) {
        console.error('Error adding tag to member:', tagError);
        // Continue anyway, tag update is not critical
      }

      console.log('Successfully subscribed to Mailchimp:', response.id);

      return NextResponse.json({
        success: true,
        message: 'Successfully signed up for notifications',
      });
    } catch (mailchimpError: any) {
      // Handle Mailchimp-specific errors
      if (mailchimpError.status === 400) {
        const errorBody = mailchimpError.response?.body;
        if (errorBody?.title === 'Member Exists') {
          // Email already exists in the list, update tags
          try {
            // Generate MD5 hash of lowercase email for MailChimp subscriber hash
            const crypto = await import('crypto');
            const subscriberHash = crypto
              .createHash('md5')
              .update(email.toLowerCase())
              .digest('hex');
            
            // Add the "news" tag to existing member
            await mailchimp.lists.updateListMemberTags(
              process.env.MAILCHIMP_AUDIENCE_ID,
              subscriberHash,
              {
                tags: [{ name: 'news', status: 'active' }],
              }
            );
            
            console.log('Successfully added "news" tag to existing member');
          } catch (tagError) {
            console.error('Error adding tag to existing member:', tagError);
            // Continue anyway, tag update is not critical
          }
          
          return NextResponse.json({
            success: true,
            message: 'You are already subscribed to our newsletter',
          });
        }
        // Return more specific error message
        console.error('Mailchimp API error:', {
          status: mailchimpError.status,
          title: errorBody?.title,
          detail: errorBody?.detail,
          errors: errorBody?.errors,
        });
        return NextResponse.json(
          { 
            error: errorBody?.detail || errorBody?.title || 'Failed to subscribe to newsletter. Please try again.',
            details: errorBody?.errors 
          },
          { status: 400 }
        );
      }

      console.error('Mailchimp error:', {
        status: mailchimpError.status,
        message: mailchimpError.message,
        response: mailchimpError.response?.body,
      });
      return NextResponse.json(
        { 
          error: 'Failed to subscribe to newsletter. Please try again.',
          details: mailchimpError.message 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing newsletter signup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process signup',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

