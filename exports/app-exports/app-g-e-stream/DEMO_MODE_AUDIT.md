# Demo Mode & Placeholder Code Audit Report

**Date:** December 28, 2025  
**Status:** COMPLETE AUDIT  
**Total Items Found:** 25+  
**Priority:** HIGH - Must clean before GitHub/Production

---

## EXECUTIVE SUMMARY

Your codebase contains **25+ demo/placeholder items** that should be removed or replaced before pushing to GitHub or production. These fall into 6 categories:

1. **Mock/Hardcoded Data** (8 items)
2. **Console.log Statements** (20+ items)
3. **TODO/FIXME Comments** (2 items)
4. **Demo Map IDs** (1 item)
5. **Simulated Uploads** (2 items)
6. **Demo Responses** (1 item)

---

## CATEGORY 1: MOCK/HARDCODED DATA (8 Items)

### 1.1 SongDetail.tsx - Mock Song Data

**File:** `client/src/pages/SongDetail.tsx` (Lines 8-21)

**Issue:** Hardcoded mock song object instead of fetching from database

```typescript
// ❌ DEMO CODE - REMOVE
const mockSong = {
  id: 1,
  title: 'Featured Track',
  artist: 'Damone Ward Sr.',
  album: 'Greatest Hits',
  genre: 'Gospel',
  duration: '4:32',
  releaseDate: '2024-01-15',
  plays: 15420,
  likes: 3240,
  image: 'https://images.unsplash.com/...',
  description: 'An uplifting gospel track...',
};
```

**Fix:** Replace with tRPC query to fetch actual track data from database

```typescript
// ✅ PRODUCTION CODE
const { data: song, isLoading } = trpc.music.getTrackById.useQuery({ id: trackId });
```

---

### 1.2 SongDetail.tsx - Mock Comments Data

**File:** `client/src/pages/SongDetail.tsx` (Lines 23-49)

**Issue:** Hardcoded mock comments instead of fetching from database

```typescript
// ❌ DEMO CODE - REMOVE
const mockComments = [
  {
    id: 1,
    author: 'Sarah M.',
    avatar: 'S',
    timestamp: '2 days ago',
    text: 'This song is absolutely amazing!...',
    likes: 24,
  },
  // ... more mock comments
];
```

**Fix:** Replace with tRPC query to fetch actual comments

```typescript
// ✅ PRODUCTION CODE
const { data: comments } = trpc.music.getTrackComments.useQuery({ trackId });
```

---

### 1.3 Discover.tsx - Mock Songs Array

**File:** `client/src/pages/Discover.tsx` (Lines 5-95)

**Issue:** Large hardcoded array of mock songs (30+ items)

```typescript
// ❌ DEMO CODE - REMOVE
const mockSongs = [
  {
    id: 'regifted-1',
    title: 'Socrates',
    artist: 'Damone Ward Sr.',
    album: 'RE-GIFTED',
    genre: 'R&B',
    // ... more mock data
  },
  // ... 30+ more mock songs
];
```

**Fix:** Replace with tRPC query to fetch actual tracks

```typescript
// ✅ PRODUCTION CODE
const { data: songs } = trpc.music.browse.useQuery({ genre: selectedGenre });
```

---

### 1.4 Discover.tsx - Using Mock Data

**File:** `client/src/pages/Discover.tsx` (Lines 100-110)

**Issue:** Filtering and displaying mock data instead of real data

```typescript
// ❌ DEMO CODE - REMOVE
const genreSet = new Set(mockSongs.map(s => s.genre));
if (!selectedGenre) return mockSongs;
return mockSongs.filter(song => song.genre === selectedGenre);
```

**Fix:** Use tRPC data instead

```typescript
// ✅ PRODUCTION CODE
const filteredSongs = songs?.filter(s => !selectedGenre || s.genre === selectedGenre) || [];
```

---

### 1.5 Home.tsx - Hardcoded Testimonials

**File:** `client/src/pages/Home.tsx`

**Issue:** Hardcoded testimonial cards with fake names and quotes

```typescript
// ❌ DEMO CODE - REMOVE
<div className="testimonial-card">
  <p className="testimonial-text">
    "This platform changed my music career..."
  </p>
  <p className="testimonial-author">- Sarah M.</p>
</div>
```

**Fix:** Replace with actual user testimonials from database or remove section

```typescript
// ✅ PRODUCTION CODE
const { data: testimonials } = trpc.content.getTestimonials.useQuery();
testimonials?.map(t => (
  <div key={t.id} className="testimonial-card">
    <p className="testimonial-text">"{t.quote}"</p>
    <p className="testimonial-author">- {t.author}</p>
  </div>
))
```

---

### 1.6 Browse.tsx - Using Mock Track Type

**File:** `client/src/pages/Browse.tsx` (Lines 8-25)

**Issue:** Manually defined Track interface instead of using generated types

```typescript
// ⚠️ DEMO CODE - Can be improved
interface Track {
  id: number;
  title: string;
  artist?: string;
  duration: number;
  audioUrl: string;
  // ... more fields
}
```

**Fix:** Import from generated types

```typescript
// ✅ PRODUCTION CODE
import type { Track } from '@/server/routers'; // Generated from tRPC
```

---

### 1.7 AdminUpload.tsx - Simulated Upload Progress

**File:** `client/src/pages/AdminUpload.tsx` (Lines 100-104)

**Issue:** Fake upload progress simulation instead of real S3 upload

```typescript
// ❌ DEMO CODE - REMOVE
for (let i = 0; i <= 100; i += 10) {
  setUploadProgress(i);
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

**Fix:** Use actual S3 upload with real progress tracking

```typescript
// ✅ PRODUCTION CODE
const uploadMutation = trpc.admin.uploadTrack.useMutation({
  onProgress: (progress) => setUploadProgress(progress),
});
```

---

### 1.8 AdminUpload.tsx - Mock File Entry

**File:** `client/src/pages/AdminUpload.tsx` (Lines 106-114)

**Issue:** Creating mock file entry instead of storing in database

```typescript
// ❌ DEMO CODE - REMOVE
const newFile: UploadedFile = {
  id: `file-${Date.now()}`,
  fileName: songData.audioFile.name,
  fileType: 'audio',
  fileSize: songData.audioFile.size,
  uploadedAt: new Date().toISOString(),
  url: URL.createObjectURL(songData.audioFile),
};
```

**Fix:** Use tRPC mutation to save to database

```typescript
// ✅ PRODUCTION CODE
const uploadMutation = trpc.admin.uploadTrack.useMutation({
  onSuccess: (newFile) => {
    setUploadedFiles([...uploadedFiles, newFile]);
  },
});
```

---

## CATEGORY 2: CONSOLE.LOG STATEMENTS (20+ Items)

### 2.1 Development Logging (Should be removed or use proper logger)

| File | Line | Code | Severity |
|------|------|------|----------|
| `client/src/pages/Browse.tsx` | 59 | `console.log('Playing:', track.title);` | LOW |
| `client/src/pages/Upload.tsx` | 109 | `console.log('Submitting:', { formData, files });` | LOW |
| `client/src/pages/ComponentShowcase.tsx` | 222 | `console.log("Dialog submitted with value:", dialogInput);` | LOW |
| `server/_core/index.ts` | Multiple | `console.log(\`Server running on...\`)` | MEDIUM |
| `server/_core/sdk.ts` | Multiple | `console.log("[OAuth] Initialized...")` | MEDIUM |

### 2.2 Error Logging (Keep but improve)

```typescript
// ⚠️ CURRENT - Basic console.error
console.error('Invalid file type');
console.error('Logout failed:', error);
console.error('[Checkout] Subscription error:', err);

// ✅ RECOMMENDED - Use proper logger
import { logger } from '@/lib/logger';
logger.error('Invalid file type', { fileType: file.type });
logger.error('Logout failed', { error, userId: user?.id });
```

### 2.3 Warning Logs (Keep but improve)

```typescript
// ⚠️ CURRENT
console.warn("[Notification] Error calling notification service:", error);
console.warn("[Auth] Missing session cookie");

// ✅ RECOMMENDED
logger.warn('Notification service failed', { error, userId });
logger.warn('Session cookie missing', { path: req.path });
```

---

## CATEGORY 3: TODO/FIXME COMMENTS (2 Items)

### 3.1 Upload.tsx - TODO Comment

**File:** `client/src/pages/Upload.tsx` (Line 110)

```typescript
// ❌ TODO - INCOMPLETE
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Submitting:', { formData, files });
  // TODO: Send to backend API
};
```

**Fix:** Implement actual backend call

```typescript
// ✅ PRODUCTION CODE
const uploadMutation = trpc.artist.uploadTrack.useMutation();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await uploadMutation.mutateAsync({
      title: formData.title,
      genre: formData.genre,
      files: files,
    });
    toast.success('Track uploaded successfully!');
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

---

### 3.2 Upload.tsx - Missing Backend API

**File:** `client/src/pages/Upload.tsx` (Lines 75-100)

```typescript
// ❌ DEMO - Simulates upload instead of sending to backend
const simulateUpload = (fileId: string) => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress >= 100) {
      // Fake success
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, status: 'success', progress: 100 } : f
        )
      );
    }
  }, 300);
};
```

**Fix:** Use actual S3 upload

```typescript
// ✅ PRODUCTION CODE
const uploadToS3 = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

---

## CATEGORY 4: DEMO MAP IDS (1 Item)

### 4.1 Map.tsx - DEMO_MAP_ID

**File:** `client/src/components/Map.tsx` (Line 141)

```typescript
// ❌ DEMO - Using placeholder map ID
const map = new google.maps.Map(mapContainer, {
  zoom: initialZoom,
  center: initialCenter,
  mapId: "DEMO_MAP_ID",  // ← PLACEHOLDER
});
```

**Fix:** Use actual Google Maps ID from environment

```typescript
// ✅ PRODUCTION CODE
const mapId = import.meta.env.VITE_GOOGLE_MAPS_ID || "YOUR_PRODUCTION_MAP_ID";

const map = new google.maps.Map(mapContainer, {
  zoom: initialZoom,
  center: initialCenter,
  mapId: mapId,
});
```

---

## CATEGORY 5: SIMULATED UPLOADS (2 Items)

### 5.1 Upload.tsx - Simulated Upload Progress

**File:** `client/src/pages/Upload.tsx` (Lines 75-100)

```typescript
// ❌ DEMO - Fake progress
const simulateUpload = (fileId: string) => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId ? { ...f, status: 'success', progress: 100 } : f
        )
      );
    }
  }, 300);
};
```

**Status:** Should be replaced with real S3 upload

---

### 5.2 AdminUpload.tsx - Simulated Upload Progress

**File:** `client/src/pages/AdminUpload.tsx` (Lines 100-104)

```typescript
// ❌ DEMO - Fake progress
for (let i = 0; i <= 100; i += 10) {
  setUploadProgress(i);
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

**Status:** Should be replaced with real S3 upload with progress events

---

## CATEGORY 6: DEMO RESPONSES (1 Item)

### 6.1 ComponentShowcase.tsx - Demo Chat Response

**File:** `client/src/pages/ComponentShowcase.tsx` (Line 222)

```typescript
// ❌ DEMO - Hardcoded demo response
content: `This is a **demo response**. In a real app, you would call a tRPC mutation here:\n\n\`\`\`typescript\nconst chatMutation = trpc.ai.chat.useMutation({\n  onSuccess: (response) => {\n    setChatMessages(prev => [...prev, {\n      role: "assistant",\n      content: response.choices[0].message.content\n    }]);\n  }\n});\n\nchatMutation.mutate({ messages: newMessages });\n\`\`\`\n\nYour message was: "${content}"`,
```

**Status:** ComponentShowcase is a demo component - can keep as-is OR remove entirely before production

---

## CLEANUP CHECKLIST

### Priority 1: MUST REMOVE (Blocks Production)

- [ ] Remove `mockSong` from SongDetail.tsx
- [ ] Remove `mockComments` from SongDetail.tsx
- [ ] Remove `mockSongs` from Discover.tsx
- [ ] Replace simulated uploads with real S3 uploads
- [ ] Replace mock file entries with database inserts
- [ ] Replace DEMO_MAP_ID with real map ID
- [ ] Complete TODO in Upload.tsx

### Priority 2: SHOULD REMOVE (Best Practice)

- [ ] Remove console.log statements (use proper logger)
- [ ] Remove hardcoded testimonials (use database)
- [ ] Remove demo responses from ComponentShowcase

### Priority 3: SHOULD IMPROVE (Code Quality)

- [ ] Implement proper error logging
- [ ] Use generated types instead of manual interfaces
- [ ] Add environment variable validation
- [ ] Implement proper progress tracking for uploads

---

## RECOMMENDED LOGGER SETUP

```typescript
// lib/logger.ts
export const logger = {
  info: (msg: string, data?: any) => {
    if (import.meta.env.DEV) console.log(`[INFO] ${msg}`, data);
  },
  error: (msg: string, error?: any) => {
    console.error(`[ERROR] ${msg}`, error);
    // Send to error tracking service (Sentry, etc.)
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[WARN] ${msg}`, data);
  },
  debug: (msg: string, data?: any) => {
    if (import.meta.env.DEV) console.debug(`[DEBUG] ${msg}`, data);
  },
};
```

---

## ENVIRONMENT VARIABLES TO ADD

```bash
# .env.production
VITE_GOOGLE_MAPS_ID=your_production_map_id
VITE_S3_BUCKET=your_production_bucket
VITE_API_URL=https://api.yourapp.com
```

---

## BEFORE GITHUB PUSH CHECKLIST

- [ ] All mock data removed or replaced with real data
- [ ] All console.log statements removed or replaced with logger
- [ ] All TODO/FIXME comments completed or removed
- [ ] All DEMO_* constants replaced with real values
- [ ] All simulated uploads replaced with real S3 uploads
- [ ] All demo responses removed
- [ ] Environment variables configured
- [ ] Error handling implemented
- [ ] Tests passing
- [ ] Code reviewed

---

## ESTIMATED CLEANUP TIME

| Category | Items | Time |
|----------|-------|------|
| Mock Data | 8 | 2-3 hours |
| Console Logs | 20+ | 30 minutes |
| TODO Comments | 2 | 1-2 hours |
| Demo IDs | 1 | 15 minutes |
| Simulated Uploads | 2 | 2-3 hours |
| Demo Responses | 1 | 15 minutes |
| **TOTAL** | **34+** | **6-9 hours** |

---

## NEXT STEPS

1. **Immediate:** Remove all mock data objects
2. **Short-term:** Replace simulated uploads with real S3
3. **Medium-term:** Implement proper logging
4. **Before Deploy:** Final audit and testing

---

**Report Generated:** December 28, 2025  
**Status:** READY FOR CLEANUP  
**Severity:** HIGH - Do not push to GitHub without addressing Priority 1 items

