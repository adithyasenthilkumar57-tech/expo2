import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, type = 'reminder' } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    const agentName = settings?.agentName || 'OpsAgent';
    const ownerName = settings?.ownerName || 'The Team';

    const daysOverdue = invoice.status === 'overdue'
      ? Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000)
      : 0;

    const subject = type === 'reminder'
      ? `Payment Reminder: ${invoice.invoiceNumber} — $${invoice.amount.toLocaleString()}`
      : `Invoice ${invoice.invoiceNumber} is Overdue — Action Required`;

    const itemsHtml = invoice.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b;">${item.description}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; text-align: right;">$${(item.quantity * item.unitPrice).toLocaleString()}</td>
          </tr>`
      )
      .join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0; padding:0; background:#0a0f1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 40px auto; background: #0d1424; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #00d4c8 0%, #7c3aed 100%); padding: 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">${agentName}</h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Autonomous Operations Platform</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      <h2 style="color: #e2e8f0; margin: 0 0 8px;">${type === 'overdue' ? '⚠️ Payment Overdue' : '💳 Payment Reminder'}</h2>
      <p style="color: #94a3b8; margin: 0 0 24px;">
        ${type === 'overdue'
          ? `Your invoice is <strong style="color:#f87171;">${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue</strong>. Please arrange payment at your earliest convenience.`
          : `This is a friendly reminder that the following invoice is due.`}
      </p>

      <!-- Invoice Details -->
      <div style="background: #0a0f1e; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #64748b; font-size: 13px;">Invoice Number</span>
          <span style="color: #e2e8f0; font-weight: 600;">${invoice.invoiceNumber}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #64748b; font-size: 13px;">Client</span>
          <span style="color: #e2e8f0;">${invoice.client}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <span style="color: #64748b; font-size: 13px;">Due Date</span>
          <span style="color: ${type === 'overdue' ? '#f87171' : '#e2e8f0'};">${invoice.dueDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #1e293b; padding-top: 12px; margin-top: 12px;">
          <span style="color: #64748b; font-size: 13px; font-weight: 600;">Total Due</span>
          <span style="color: #00d4c8; font-size: 20px; font-weight: 700;">$${invoice.amount.toLocaleString()}</span>
        </div>
      </div>

      <!-- Line Items -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #1e293b;">
            <th style="padding: 10px 12px; text-align: left; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Description</th>
            <th style="padding: 10px 12px; text-align: center; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Qty</th>
            <th style="padding: 10px 12px; text-align: right; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Unit Price</th>
            <th style="padding: 10px 12px; text-align: right; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody style="color: #e2e8f0; font-size: 14px;">
          ${itemsHtml}
        </tbody>
      </table>

      <p style="color: #64748b; font-size: 13px; margin: 0;">
        If you have already made this payment, please disregard this message. For questions, reply to this email or contact ${ownerName} directly.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding: 20px 32px; border-top: 1px solid #1e293b; text-align: center;">
      <p style="color: #475569; font-size: 12px; margin: 0;">
        Sent by ${agentName} · Autonomous Operations Platform<br>
        This is an automated message.
      </p>
    </div>
  </div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'Cresconix <onboarding@resend.dev>',
      replyTo: 'cresconix@gmail.com',
      to: [invoice.email],
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 });
    }

    // Update invoice with last reminder sent time
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { lastReminderSent: new Date() },
    });

    // Log activity
    await prisma.activityEvent.create({
      data: {
        type: 'dunning_sent',
        title: type === 'overdue' ? 'Overdue notice sent' : 'Payment reminder sent',
        description: `${invoice.invoiceNumber} reminder sent to ${invoice.client} (${invoice.email}) for $${invoice.amount.toLocaleString()}`,
      },
    });

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error('Error sending invoice email:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
