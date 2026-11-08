function drawCover(prompt) {
  const title = String(prompt || "Gifted Eternity")
    .replace(/\s+/g, " ")
    .slice(0, 60);
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 480, 480);
  g.addColorStop(0, "#1b2a6b");
  g.addColorStop(0.45, "#4a1d6e");
  g.addColorStop(0.75, "#8a2be2");
  g.addColorStop(1, "#f5a623");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 480, 480);
  for (let i = 0; i < 60; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 480, Math.random() * 480, Math.random() * 3, 0, 7);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("♪ GIFTED ETERNITY ♪", 240, 215);
  ctx.font = "19px system-ui";
  const lines = title.split(/[.,\n]/)[0];
  ctx.fillText(lines.slice(0, 34), 240, 260);
  return canvas.toDataURL("image/png").replace(/^data:.*?base64,/, "");
}

function post(url, body, opts) {
  const prompt = ((body && body.text_prompts && body.text_prompts[0] &&
    body.text_prompts[0].text) || "").trim();
  return Promise.resolve({
    data: { artifacts: [{ base64: drawCover(prompt) }] },
    ok: true
  });
}

module.exports = { post, get: post };