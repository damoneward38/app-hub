import { Release } from "../types/release";

export async function freshContentBot(event: Release) {
  console.log("🌟 Fresh Content Bot triggered:", event);
  
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
              content: `Generate 2 unique and trendy promotional ideas for this release:
Artist: ${event.artist}
Track: ${event.track}

Think about current social media trends, viral formats, and innovative ways to engage fans.`
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
    
    let freshIdeas = "";
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
            freshIdeas += json.textDelta;
          }
        }
      }
    }
    
    console.log(`✨ Fresh Content Bot generated:`, freshIdeas);
    return freshIdeas || `Fresh promotional ideas for "${event.track}" by ${event.artist}:\n1. Create a trending audio snippet for Reels/TikTok\n2. Launch a fan-generated content campaign with exclusive previews`;
  } catch (error) {
    console.error('❌ Fresh Content Bot failed:', error);
    const fallback = `Fresh promotional ideas for "${event.track}" by ${event.artist}:\n1. Create a trending audio snippet for Reels/TikTok\n2. Launch a fan-generated content campaign with exclusive previews`;
    console.log('🌟 Fresh Content Bot using fallback:', fallback);
    return fallback;
  }
}
