# Video Playback Error Troubleshooting

## Error: NSURLErrorDomain Code -1008

This error indicates that the video resource is unavailable. Here are the most common causes and solutions:

### 1. Network Connectivity Issues

**Symptoms:**
- Error code -1008 (NSURLErrorResourceUnavailable)
- Videos fail to load consistently

**Solutions:**
- Check internet connection
- Try switching between WiFi and cellular data
- Test with a different network

### 2. Invalid or Expired Video URLs

**Symptoms:**
- Some videos work, others don't
- Videos that worked before now fail

**Solutions:**
- Check if the video URL is still valid
- For Supabase URLs, verify the file still exists in storage
- Check if signed URLs have expired (they typically last 1 hour)

### 3. Supabase Storage Configuration Issues

**Symptoms:**
- All videos from Supabase storage fail
- Public URLs return 403 or 404 errors

**Solutions:**
- Verify Supabase storage bucket is configured correctly
- Check if files are in the correct bucket (`videos`)
- Ensure proper RLS (Row Level Security) policies

### 4. CORS Issues

**Symptoms:**
- Videos fail to load in development
- Network requests are blocked

**Solutions:**
- Check Supabase CORS configuration
- Verify allowed origins in Supabase dashboard

## Diagnostic Steps

### Step 1: Check the Console Logs

Look for these log messages in your development console:

```
🎥 [VideoPlayer] Loading video: [URL]
🧪 [VideoService] Testing video URL accessibility...
📊 [VideoService] Response status: [STATUS]
```

### Step 2: Test Video URL Manually

Use the diagnostic script:

```bash
node scripts/diagnose-video-url.js "YOUR_VIDEO_URL_HERE"
```

### Step 3: Check Supabase Storage

1. Go to your Supabase dashboard
2. Navigate to Storage > videos
3. Verify the file exists
4. Try accessing the public URL directly in a browser

### Step 4: Test with a Known Working URL

Replace the problematic URL with a test URL:

```javascript
// Test with a known working video URL
const testUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
```

## Common Fixes

### Fix 1: Regenerate Signed URLs

If using signed URLs, they expire after 1 hour. The app should automatically regenerate them:

```javascript
// This happens automatically in video-service.ts
const signedUrl = await this.getSignedVideoUrl(videoUrl);
```

### Fix 2: Update Supabase Storage Policies

Ensure your RLS policies allow video access:

```sql
-- Allow authenticated users to read videos
CREATE POLICY "Allow authenticated users to read videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
```

### Fix 3: Check File Permissions

Verify the video file has proper permissions in Supabase storage.

## Prevention

1. **Always validate video URLs** before passing them to the player
2. **Implement proper error handling** with user-friendly messages
3. **Use signed URLs for private content** and refresh them before expiry
4. **Test video playback** in different network conditions

## Getting Help

If the issue persists:

1. Check the full error details in console logs
2. Test the video URL with the diagnostic script
3. Verify Supabase storage configuration
4. Contact support with the specific error details and video URL (without sensitive data)