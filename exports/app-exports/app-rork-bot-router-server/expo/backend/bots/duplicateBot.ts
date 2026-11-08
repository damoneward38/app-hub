import { Release } from "../types/release";
import { releasesStorage } from "../storage/releases";

export async function duplicateBot(event: Release) {
  console.log("🔄 Duplicate Bot triggered:", event);
  
  try {
    const allReleases = await releasesStorage.getAll();
    const duplicates = allReleases.filter(
      r => r.id !== event.id && 
           r.artist.toLowerCase() === event.artist.toLowerCase() && 
           r.track.toLowerCase() === event.track.toLowerCase()
    );
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Duplicate Bot found ${duplicates.length} potential duplicate(s)`);
      return { hasDuplicates: true, count: duplicates.length, duplicates };
    }
    
    console.log(`✅ No duplicates found for: ${event.artist} - ${event.track}`);
    return { hasDuplicates: false, count: 0, duplicates: [] };
  } catch (error) {
    console.error('❌ Duplicate Bot failed:', error);
    console.log('🔄 Duplicate Bot completing with error state');
    return { hasDuplicates: false, count: 0, duplicates: [], error: true };
  }
}
