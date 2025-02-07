import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(resendApiKey);

export async function POST(request) {
  console.log('API Route started - POST request received');
  
  if (!resendApiKey) {
    console.error('API Key missing in request');
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key' },
      { status: 500 }
    );
  }

  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    console.log('Form data received:', Object.fromEntries(formData.entries()));
    
    // Prepare email attachments
    const attachments = [];
    const files = ['idFront', 'idBack', 'idAttachment', 'bankApproval'];
    
    console.log('Processing file attachments...');
    for (const file of files) {
      const uploadedFile = formData.get(file);
      if (uploadedFile) {
        console.log(`Processing file: ${file}, name: ${uploadedFile.name}`);
        try {
          const buffer = await uploadedFile.arrayBuffer();
          attachments.push({
            filename: uploadedFile.name,
            content: Buffer.from(buffer)
          });
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
        }
      }
    }
    console.log('Attachments processed:', attachments.length);

    // Create the email content
    console.log('Creating email content...');
    const emailContent = `<div dir="rtl" style="text-align: right; direction: rtl; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">פרטי טופס חדש</h1>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #0070f3;">⚡ סטטוס תעסוקה</h3>
       <p> • סיים לעבוד: ${formData.get('finishedWork')} </p>
       <p> • תאריך סיום: ${formData.get('endDate') || 'לא צוין'} </p>

       <p> • טפסי 161: ${formData.get('closingPapers')} </p>
       <p> • עובד כיום: ${formData.get('currentEmploymentStatus')} </p>
       <p> • משכורת נוכחית: ${formData.get('salary') || 'לא צוין'} </p>
       <p> • מעסיק נוכחי: ${formData.get('employerName') || 'לא צוין'} </p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #0070f3;">🏥 מצב רפואי ופיננסי</h3>
        <p> • בעיות משפטיות: ${formData.get('financialIssues')} </p>
        <p> • נכות: ${formData.get('disability')} </p>

        <p> • תביעת נכות: ${formData.get('disabilityClaim')} </p>
      </div>


      <div style="margin: 20px 0;">
        <h3 style="color: #0070f3;">👤 פרטים אישיים</h3>
        <p> • שם מלא: ${formData.get('fullName')} </p>
        <p> • טלפון: ${formData.get('phone')} </p>
        <p> • ת.ז: ${formData.get('idNumber')} </p>
        <p> • עיר: ${formData.get('city')} </p>

        <p> • מוכן לשיחה: ${formData.get('transparentCall')} </p>
      </div>


      <div style="margin: 20px 0;">
        <h3 style="color: #0070f3;">📎 קבצים מצורפים</h3>
        <p> • צילום ת.ז - צד 1: ${formData.get('idFront') ? '✓' : '✗'} </p> 

        <p> • צילום ת.ז - צד 2: ${formData.get('idBack') ? '✓' : '✗'} </p>
        <p> • צילום ספח ת.ז: ${formData.get('idAttachment') ? '✓' : '✗'} </p>

        <p> • אישור ניהול חשבון בנק: ${formData.get('bankApproval') ? '✓' : '✗'} </p>
      </div>
    </div>`;


    try {
      console.log('Sending email via Resend...');
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'shhadytours@gmail.com',
        subject: 'New Form Submission - טופס ללקוחות',
        html: emailContent,
        attachments: attachments
      });

      console.log('Email sent successfully:', data);
      return NextResponse.json({ success: true, data });
    } catch (emailError) {
      console.error('Resend API Error:', emailError);
      // Return a more specific error response
      return NextResponse.json(
        { error: `Email sending failed: ${emailError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    // Return a more detailed error response
    return NextResponse.json(
      { 
        error: error.message || 'Failed to send email',
        details: error.stack
      },
      { status: 500 }
    );
  }
} 