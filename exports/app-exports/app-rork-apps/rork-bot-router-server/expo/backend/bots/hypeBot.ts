import { Release } from "../types/release";

export async function hypeBot(event: Release) {
  console.log("🎉 Hype Bot triggered:", event);
  
  try {
    const response = await fetch(
      new URL("/agent/chat", process.env["EXPO_PUBLIC_TOOLKIT_URL"]),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Create an exciting social media announcement for this music release:
Artist: ${event.artist}
Track: ${event.track}

Make it energetic, use emojis, and keep it under 280 characters for Twitter.`
            }
          ]
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");
    
    let hypeText = "";
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("0:")) {
          const json = JSON.parse(line.slice(2));
          if (json.type === "text-delta" && json.textDelta) {
            hypeText += json.textDelta;
          }
        }
      }
    }
    
    console.log(`🔥 Hype Bot generated:`, hypeText);
    return hypeText || `🔥 NEW RELEASE ALERT! ${event.artist} just dropped "${event.track}"! 🔥`;
  } catch (error) {
    console.error('❌ Hype Bot failed:', error);
    const fallback = `🔥 NEW RELEASE ALERT! ${event.artist} just dropped "${event.track}"! 🔥`;
    console.log('🔥 Hype Bot using fallback:', fallback);
    return fallback;
  }
}
