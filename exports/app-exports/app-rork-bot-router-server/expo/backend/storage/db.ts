import { Surreal } from 'surrealdb';

let db: Surreal | null = null;

export async function getDB() {
  if (db) return db;

  db = new Surreal();

  const endpoint = process.env.EXPO_PUBLIC_RORK_DB_ENDPOINT;
  const namespace = process.env.EXPO_PUBLIC_RORK_DB_NAMESPACE;
  const database = process.env.EXPO_PUBLIC_RORK_DB_DATABASE || namespace;
  const token = process.env.EXPO_PUBLIC_RORK_DB_TOKEN;

  if (!endpoint || !namespace || !token) {
    console.error('⚠️ Database credentials not configured, using in-memory storage');
    throw new Error('Database not configured');
  }

  try {
    const connectPromise = db.connect(endpoint, {
      namespace,
      database,
      auth: token,
    });
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB connection timeout')), 3000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    console.log('✅ Connected to SurrealDB');
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to SurrealDB:', error);
    db = null;
    throw error;
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        console.log(`🔄 Retrying...`);
      }
    }
  }
  
  throw lastError;
}
