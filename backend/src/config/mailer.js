import nodemailer from 'nodemailer';

const emailHost = process.env.EMAIL_HOST;
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailHost || !emailPort || !emailUser || !emailPass) {
  throw new Error('Email SMTP configuration is incomplete');
}

export const mailerTransport = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});
