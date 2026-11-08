const dashboard = async () => {
    // 1. Fetch System State from DB (The Source of Truth)
    const status = await db.getSystemStatus(); 
    
    // 2. Fetch Drift snapshot (The Sentinel)
    const drift = await db.getLatestDrift(); 
    
    // 3. Render
    console.clear();
    console.log(`[STATUS]: ${status.isLocked ? '!!! LOCKED !!!' : 'OK'}`);
    console.log(`[DRIFT]: ${drift.value} (Limit: 0.05%)`);
    // ...render table...
};

setInterval(dashboard, 1000); // 1-second refresh