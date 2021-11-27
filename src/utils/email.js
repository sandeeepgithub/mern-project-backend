const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const { email, subject, message, link } = options;

  const transport = nodemailer.createTransport({
    host: process.env.HOST_URL,
    port: process.env.EMAIL_AUTH_PORT,
    auth: {
      user: process.env.EMAIL_AUTH_USERNAME,
      pass: process.env.EMAIL_AUTH_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Pulkit Sharma <pulkitsharma12@mail.co>',
    to: email,
    subject: subject,
    text: message,
    html: `<a href=${link}> Click here to activate the account. </a>`,
  };

  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
