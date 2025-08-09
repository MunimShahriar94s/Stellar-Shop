import nodemailer from 'nodemailer';

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, fromName = 'StellarShop' }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `${fromName} <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};


