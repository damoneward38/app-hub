function createTransport(cfg) {
  const mailbox = (globalThis.__mailbox__ = globalThis.__mailbox__ || []);
  return {
    sendMail: async (opts) => {
      mailbox.push({
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        sentAt: new Date().toLocaleTimeString()
      });
      return { messageId: "q1<" + Date.now() + "@demo>" };
    }
  };
}

module.exports = { createTransport };