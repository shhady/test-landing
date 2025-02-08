export const config = {
  api: {
    bodyParser: false
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
    let body;
    let bankApprovalPdf;

    // Check if the request is multipart form data
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      bankApprovalPdf = formData.get('bankApprovalPdf');
      
      // Convert form data to object
      body = {};
      for (let [key, value] of formData.entries()) {
        if (key !== 'bankApprovalPdf') {
          // Convert 'null' and 'undefined' strings to actual null
          body[key] = value === 'null' || value === 'undefined' ? null : value;
        }
      }
    } else {
      body = await request.json();
    }

    console.log('Processing form submission with data:', {
      ...body,
      bankApprovalPdf: bankApprovalPdf ? 'PDF File Present' : 'No PDF'
    });

    const emailContent = `<div dir="rtl" style="text-align: right; direction: rtl; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #1b283c; padding-bottom: 10px;">פרטי טופס חדש</h1>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">⚡ סטטוס תעסוקה</h3>
        <p>• סיים לעבוד: ${body.finishedWork || 'לא צוין'}</p>
        <p>• תאריך סיום: ${body.endDate || 'לא צוין'}</p>
        <p>• טפסי 161: ${body.closingPapers || 'לא צוין'}</p>
        <p>• עובד כיום: ${body.currentEmploymentStatus || 'לא צוין'}</p>
        <p>• משכורת נוכחית: ${body.salary || 'לא צוין'}</p>
        <p>• מעסיק נוכחי: ${body.employerName || 'לא צוין'}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">🏥 מצב רפואי ופיננסי</h3>
        <p>• בעיות משפטיות: ${body.financialIssues || 'לא צוין'}</p>
        <p>• נכות: ${body.disability || 'לא צוין'}</p>
        <p>• תביעת נכות: ${body.disabilityClaim || 'לא צוין'}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">👤 פרטים אישיים</h3>
        <p>• שם מלא: ${body.fullName || 'לא צוין'}</p>
        <p>• טלפון: ${body.phone || 'לא צוין'}</p>
        <p>• ת.ז: ${body.idNumber || 'לא צוין'}</p>
        <p>• עיר: ${body.city || 'לא צוין'}</p>
        <p>• מוכן לשיחה: ${body.transparentCall || 'לא צוין'}</p>
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
            ${body.bankApproval === 'pdf-attachment' ? 
              '(מצורף כקובץ PDF)' : 
              `<a href="${body.bankApproval}" target="_blank" style="color: #0070f3; text-decoration: none; margin-right: 10px;">
                👁️ צפייה
              </a>`
            }
          </p>
        </div>
      </div>
    </div>`;

    const emailOptions = {
      from: 'onboarding@resend.dev',
      to: 'shhadytours@gmail.com',
      subject: `טופס חדש - ${body.fullName}`,
      html: emailContent,
    };

    // Add PDF attachment if exists
    if (bankApprovalPdf) {
      const pdfBuffer = await bankApprovalPdf.arrayBuffer();
      emailOptions.attachments = [{
        filename: `bank-approval-${body.fullName}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf',
      }];
    }

    console.log('Sending email with options:', { ...emailOptions, attachments: emailOptions.attachments ? 'PDF Attached' : 'No PDF' });
    const data = await resend.emails.send(emailOptions);
    console.log('Email sent successfully:', data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    );
  }
}
