export const config = {
  api: {
    bodyParser: false
  },
};

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ApiClient } from '@mondaydotcomorg/api';
import { allowedAgents } from '../../config/agents';

const resendApiKey = process.env.RESEND_API_KEY;
const mondayApiKey = process.env.MONDAY_API_KEY;
const resend = new Resend(resendApiKey);
const mondayClient = new ApiClient({ token: mondayApiKey });

export async function POST(request) {
  if (!resendApiKey || !mondayApiKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing API keys' },
      { status: 500 }
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let body;
    let bankApprovalPdf;
    let pdfBuffer;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      bankApprovalPdf = formData.get('bankApprovalPdf');
      
      body = {};
      for (let [key, value] of formData.entries()) {
        if (key === 'bankApprovalPdf') {
          const pdfArrayBuffer = await value.arrayBuffer();
          pdfBuffer = Buffer.from(pdfArrayBuffer);
        } else {
          body[key] = value === 'null' || value === 'undefined' ? null : value;
        }
      }
    } else {
      body = await request.json();
    }

    // Get agent's full name if agentName is provided
    let agentFullName = '';
    if (body.agentName) {
      const agent = allowedAgents.find(agent => agent.id === body.agentName);
      if (agent) {
        agentFullName = agent.name;
      }
    }

    const emailContent = `<div dir="rtl" style="text-align: right; direction: rtl; font-family: Arial, sans-serif;">
      <h1 style="color: #333; border-bottom: 2px solid #1b283c; padding-bottom: 10px;">פרטי טופס חדש</h1>

      ${agentFullName ? `
      <div style="margin: 20px 0; padding: 15px; background-color: #f0f7ff; border-radius: 8px;">
        <h3 style="color: #1b283c; margin: 0;">🎯 פרטי סוכן</h3>
        <p style="margin: 10px 0 0 0;">• שם הסוכן: ${agentFullName}</p>
      </div>
      ` : ''}

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">⚡ סטטוס תעסוקה</h3>
        <p>• סיים לעבוד: ${body.finishedWork}</p>
        <p>• תאריך סיום: ${body.endDate || 'לא צוין'}</p>
        <p>• טפסי 161: ${body.closingPapers}</p>
        <p>• עובד כיום: ${body.currentEmploymentStatus}</p>
        <p>• משכורת נוכחית: ${body.salary || 'לא צוין'}</p>
        <p>• שם מעסיק נוכחי: ${body.employerName || 'לא צוין'}</p>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #1b283c;">🏥 מצב רפואי ופיננסי</h3>
        <p>• האם ללקוח קיים עיקולים? בעיות בספרי הבנק? הוצאה לפועל? שיקים ותשלומים שחזרו? ${body.financialIssues}</p>
        <p>• האם קיימת נכות ללקוח או לאחד מבני המשפחה? ${body.disability}</p>
        <p>• האם קיימת תביעת נכות מתנהלת מול ביטוח לאומי או חברת הביטוח? ${body.disabilityClaim}</p>
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
      to: process.env.TO_EMAIL,
      subject: `טופס חדש - ${body.fullName}${agentFullName ? ` (${agentFullName})` : ''}`,
      html: emailContent,
    };

    // Add PDF attachment if exists
    if (bankApprovalPdf) {
      emailOptions.attachments = [{
        filename: `bank-approval-${body.fullName}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }];
    }

    // Send email
    console.log('Sending email with options:', { ...emailOptions, attachments: emailOptions.attachments ? 'PDF Attached' : 'No PDF' });
    const emailData = await resend.emails.send(emailOptions);
    console.log('Email sent successfully:', emailData);

    // After successful email, create Monday.com record
    try {
      const boardId = process.env.MONDAY_BOARD_ID;
        
      // Format the column values according to Monday.com's API requirements
      // Using the exact format that worked in the API playground
      const columnValues = JSON.stringify({
        status_mkmyxmvx: { label: "new lead" },
        date4: { date: new Date().toISOString().split('T')[0] },
        text_mkn2wqm2: body.finishedWork || '',
        status: agentFullName || '',
        phone_mkn2313f: body.phone || '',
        text_mkn2rpn2:body.idNumber || '',
        text_mkn2q52f:body.endDate || '',
        text_mkn2w04m:body.closingPapers || '',
        text_mkn2kggf:body.disability || '',
        text_mkn2mjwe:body.disabilityClaim || '',
        text_mkn2vzyk:body.financialIssues || '',
        text_mkn2kvn3:body.currentEmploymentStatus || '',
        text_mkn2d7yc:body.salary || '',
        text_mkn2ampw:body.employerName || '',
        text_mkn2kfkn:body.transparentCall || '',
        text_mkn2mzp0:body.city || '',
        text_mkn2x1qt:body.idFront || '',
        text_mkn2tqs3:body.idBack || '',
        text_mkn2qdb9:body.idAttachment || '',
        text_mkn2pf5n:body.bankApproval === 'pdf-attachment' ? ' קובץ במייל': body.bankApproval || '',
      });

      // Create the item with properly formatted column values
      const mutation = `
        mutation {
          create_item (
            board_id: ${boardId}, 
            item_name: "${body.fullName || 'New User'}",
            column_values: ${JSON.stringify(columnValues)}
          ) {
            id
          }
        }
      `;

      const newItem = await mondayClient.request(mutation);

      console.log('Monday.com record created successfully:', newItem);
      return NextResponse.json({ success: true, emailData, mondayData: newItem });
    } catch (mondayError) {
      console.error('Error creating Monday.com record:', mondayError);
      // Still return success since email was sent
      return NextResponse.json({ 
        success: true, 
        emailData, 
        mondayError: 'Failed to create Monday.com record'
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'שגיאה בעיבוד הבקשה' },
      { status: 500 }
    );
  }
}
