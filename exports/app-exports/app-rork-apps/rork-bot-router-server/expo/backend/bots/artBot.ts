import { Release } from "../types/release";

export async function artBot(event: Release) {
  console.log("🎨 Art Bot triggered:", event);
  
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
              content: `Create a detailed artwork prompt for this music release:
Artist: ${event.artist}
Track: ${event.track}

Describe the visual style, mood, colors, and elements that would make great cover art.`
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
    
    let artPrompt = "";
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
            artPrompt += json.textDelta;
          }
        }
      }
    }
    
    console.log(`🖼️ Art Bot generated:`, artPrompt);
    return artPrompt || `Artwork concept for "${event.track}" by ${event.artist}: Modern, vibrant design with bold typography and dynamic color palette reflecting the track's energy.`;
  } catch (error) {
    console.error('❌ Art Bot failed:', error);
    const fallback = `Artwork concept for "${event.track}" by ${event.artist}: Modern, vibrant design with bold typography and dynamic color palette reflecting the track's energy.`;
    console.log('🎨 Art Bot using fallback:', fallback);
    return fallback;
  }
}
