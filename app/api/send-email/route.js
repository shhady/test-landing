export const config = {
  api: {
    bodyParser: true
  },
};

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(resendApiKey);

async function downloadFile(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download file');
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

export async function POST(request) {
  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('Received payload:', body);

    // Download files from Cloudinary
    const attachments = [];
    const fileFields = {
      idFront: 'תעודת זהות - צד קדמי',
      idBack: 'תעודת זהות - צד אחורי',
      idAttachment: 'ספח תעודת זהות',
      bankApproval: 'אישור ניהול חשבון בנק'
    };

    for (const [field, description] of Object.entries(fileFields)) {
      if (body[field]) {
        try {
          console.log(`Downloading ${description} from ${body[field]}`);
          const fileContent = await downloadFile(body[field]);
          const fileExtension = body[field].split('.').pop();
          attachments.push({
            filename: `${description}.${fileExtension}`,
            content: fileContent
          });
        } catch (error) {
          console.error(`Error downloading ${description}:`, error);
        }
      }
    }

    const emailContent = `<div dir="rtl" style="text-align: right; direction: rtl; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #1b283c; padding-bottom: 10px;">פרטי טופס חדש</h1>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">⚡ סטטוס תעסוקה</h3>
        <p>• סיים לעבוד: ${body.finishedWork}</p>
        <p>• תאריך סיום: ${body.endDate || 'לא צוין'}</p>
        <p>• טפסי 161: ${body.closingPapers}</p>
        <p>• עובד כיום: ${body.currentEmploymentStatus}</p>
        <p>• משכורת נוכחית: ${body.salary || 'לא צוין'}</p>
        <p>• מעסיק נוכחי: ${body.employerName || 'לא צוין'}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">🏥 מצב רפואי ופיננסי</h3>
        <p>• בעיות משפטיות: ${body.financialIssues}</p>
        <p>• נכות: ${body.disability}</p>
        <p>• תביעת נכות: ${body.disabilityClaim}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">👤 פרטים אישיים</h3>
        <p>• שם מלא: ${body.fullName}</p>
        <p>• טלפון: ${body.phone}</p>
        <p>• ת.ז: ${body.idNumber}</p>
        <p>• עיר: ${body.city}</p>
        <p>• מוכן לשיחה: ${body.transparentCall}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">📎 קבצים מצורפים</h3>
        <p>• צילום ת.ז - צד 1: ${body.idFront ? '✓ (מצורף)' : '✗'}</p>
        <p>• צילום ת.ז - צד 2: ${body.idBack ? '✓ (מצורף)' : '✗'}</p>
        <p>• צילום ספח ת.ז: ${body.idAttachment ? '✓ (מצורף)' : '✗'}</p>
        <p>• אישור ניהול חשבון בנק: ${body.bankApproval ? '✓ (מצורף)' : '✗'}</p>
      </div>
    </div>`;

    try {
      const data = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'shhadytours@gmail.com',
        subject: 'טופס חדש - משיכת כספים',
        html: emailContent,
        attachments: attachments
      });

      console.log('Email sent successfully:', data);
      return NextResponse.json({ success: true, data });
    } catch (emailError) {
      console.error('Resend API Error:', emailError);
      return NextResponse.json(
        { error: 'שגיאה בשליחת האימייל' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    );
  }
}
