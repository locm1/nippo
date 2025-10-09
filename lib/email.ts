import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'test@example.com',
      to,
      subject,
      html,
    })
    
    console.log('メール送信成功:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('メール送信エラー:', error)
    return { success: false, error }
  }
}