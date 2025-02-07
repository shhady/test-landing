export const config = {
  api: {
    bodyParser: true
  },
};

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export async function POST(request) {
  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('Processing form submission...');

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
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
          <p style="margin: 10px 0;">
            <strong>צילום ת.ז - צד 1:</strong><br>
            <a href="${body.idFront}" target="_blank" style="color: #0070f3; text-decoration: none; margin-right: 10px;">
              👁️ צפייה
            </a>
          
          </p>
          
          <p style="margin: 10px 0;">
            <strong>צילום ת.ז - צד 2:</strong><br>
            <a href="${body.idBack}" target="_blank" style="color: #0070f3; text-decoration: none; margin-right: 10px;">
              👁️ צפייה
            </a>
           
          </p>
          
          <p style="margin: 10px 0;">
            <strong>צילום ספח ת.ז:</strong><br>
            <a href="${body.idAttachment}" target="_blank" style="color: #0070f3; text-decoration: none; margin-right: 10px;">
              👁️ צפייה
            </a>
           
          </p>
          
          <p style="margin: 10px 0;">
            <strong>אישור ניהול חשבון בנק:</strong><br>
            <a href="${body.bankApproval}" target="_blank" style="color: #0070f3; text-decoration: none; margin-right: 10px;">
              👁️ צפייה
            </a>
         
          </p>
        </div>
      </div>
    </div>`;

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'shhadytours@gmail.com',
      subject: `טופס חדש - ${body.fullName}`,
      html: emailContent
    });

    console.log('Email sent successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    );
  }
}
