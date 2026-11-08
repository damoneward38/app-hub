import { Release } from "../types/release";

export async function aiBrainBot(event: Release) {
  console.log("🤖 AI Brain Bot triggered:", event);
  
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
              content: `Analyze this music release and provide strategic insights:
Artist: ${event.artist}
Track: ${event.track}

Provide:
1. Target audience analysis
2. Best platforms for promotion
3. Optimal posting times
4. Key hashtags to use`
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
    
    let analysis = "";
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
            analysis += json.textDelta;
          }
        }
      }
    }
    
    console.log(`🧠 AI Brain Bot analyzed:`, analysis);
    return analysis || `Strategic analysis for "${event.track}" by ${event.artist}:\n1. Target: Music streaming platform users, genre-specific fans\n2. Platforms: Spotify, Apple Music, TikTok, Instagram\n3. Timing: Friday releases, peak hours 6-9 PM\n4. Hashtags: #NewMusic #${event.artist.replace(/\s+/g, '')} #MusicRelease`;
  } catch (error) {
    console.error('❌ AI Brain Bot failed:', error);
    const fallback = `Strategic analysis for "${event.track}" by ${event.artist}:\n1. Target: Music streaming platform users, genre-specific fans\n2. Platforms: Spotify, Apple Music, TikTok, Instagram\n3. Timing: Friday releases, peak hours 6-9 PM\n4. Hashtags: #NewMusic #${event.artist.replace(/\s+/g, '')} #MusicRelease`;
    console.log('🤖 AI Brain Bot using fallback:', fallback);
    return fallback;
  }
}
