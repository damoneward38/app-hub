import { Release } from "../types/release";

export async function contentBot(event: Release) {
  console.log("📝 Content Bot triggered:", event);
  
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
              content: `Generate 3 creative content ideas for promoting this music release:
Artist: ${event.artist}
Track: ${event.track}

Provide diverse ideas (e.g., Instagram story, TikTok challenge, blog post).`
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
    
    let contentIdeas = "";
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
            contentIdeas += json.textDelta;
          }
        }
      }
    }
    
    console.log(`💡 Content Bot generated:`, contentIdeas);
    return contentIdeas || `Content ideas for: ${event.artist} - ${event.track}\n1. Instagram Story: Behind-the-scenes creation\n2. TikTok Challenge: Dance/lip-sync trend\n3. Blog Post: Story behind the track`;
  } catch (error) {
    console.error('❌ Content Bot failed:', error);
    const fallback = `Content ideas for: ${event.artist} - ${event.track}\n1. Instagram Story: Behind-the-scenes creation\n2. TikTok Challenge: Dance/lip-sync trend\n3. Blog Post: Story behind the track`;
    console.log('📝 Content Bot using fallback:', fallback);
    return fallback;
  }
}
