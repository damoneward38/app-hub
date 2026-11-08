const Configuration = (cfg) => ({ apiKey: (cfg && cfg.apiKey) || "demo" });

const OPENAI_ORDER = [
  "Thank you for reaching out. I would love to explore this collaboration.",
  "We are delighted to hear from you — let's set up a call this week.",
  "Appreciate your interest in our music. We'll circle back shortly.",
  "Sounds like a great opportunity. Our team will follow up within 24h."
];

class OpenAIApi {
  constructor() {
    this._n = 0;
  }
  async createChatCompletion({ messages }) {
    const user = [...messages].reverse().find((m) => m.role === "user");
    const body = (user && user.content) || "";
    const reply =
      `Dear partner,\n\n${OPENAI_ORDER[this._n++ % OPENAI_ORDER.length]}\n\n` +
      `Re your message: "${String(body).slice(0, 80)}"\n\nWarm regards,\nGifted Eternity Records`;
    return { data: { choices: [{ message: { content: reply } }] } };
  }
}

module.exports = { OpenAIApi, Configuration };