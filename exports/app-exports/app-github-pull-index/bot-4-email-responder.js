// ==========================================
// Bot 4 – Email Responder
// File: server/bots/bot-4-email-responder.js
// ==========================================

const nodemailer = require("nodemailer");
const { OpenAIApi, Configuration } = require("openai");

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })
);

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

async function getIncomingEmails() {
  return [
    {
      from: "example@sender.com",
      subject: "Business Inquiry",
      body: "I would like to discuss a collaboration opportunity."
    }
  ];
}

async function collectEmails() {
  console.log("🤖 Bot 4: Collecting emails...");
  return await getIncomingEmails();
}

async function generateEmailResponse(email) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a professional music business email assistant."
      },
      {
        role: "user",
        content: `Reply professionally to this email:\n\n${email.body}`
      }
    ],
    max_tokens: 500
  });

  return response.data.choices[0].message.content;
}

async function sendEmailResponse(email, response) {
  await emailTransporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email.from,
    subject: `Re: ${email.subject}`,
    html: `<p>${response}</p>`
  });

  console.log(`✅ Email sent to ${email.from}`);
}

async function processEmailQueue(emails) {
  for (const email of emails) {
    const response = await generateEmailResponse(email);
    await sendEmailResponse(email, response);
  }
}

async function runEmailBot() {
  const emails = await collectEmails();
  await processEmailQueue(emails);
}

module.exports = {
  collectEmails,
  processEmailQueue,
  runEmailBot
};
