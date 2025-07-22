# RTMP Streaming Setup Guide for HaritaHive

## Current Issues & Solutions

### 1. DNS Resolution Issue
**Problem**: OBS shows "host name not found" for `rtmp://stream.haritahive.com/live`

**Solution Required (Infrastructure Team)**:
```bash
# DNS Configuration needed:
# Point stream.haritahive.com to 13.60.65.33

# Route53 Record:
Type: A
Name: stream.haritahive.com
Value: 13.60.65.33
TTL: 300
```

### 2. EC2 NGINX RTMP Configuration
**Required on EC2 instance (13.60.65.33)**:

```nginx
# /etc/nginx/nginx.conf
events {
    worker_connections 1024;
}

rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        allow publish all;
        
        application live {
            live on;
            
            # Enable recording
            record all;
            record_path /var/recordings;
            record_suffix .mp4;
            record_unique on;
            
            # HLS Configuration
            hls on;
            hls_path /var/www/html/hls;
            hls_fragment 3;
            hls_playlist_length 60;
            
            # Webhook for stream events
            on_publish http://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/rtmp-webhook;
            on_publish_done http://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/rtmp-webhook;
            
            # Stream authentication (optional)
            # on_play http://your-auth-endpoint;
        }
    }
}

http {
    include /etc/nginx/mime.types;
    
    server {
        listen 80;
        server_name stream.haritahive.com;
        
        # Serve HLS files
        location /hls {
            root /var/www/html;
            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods GET,POST,OPTIONS;
            add_header Access-Control-Allow-Headers Content-Type;
        }
        
        # Serve recordings
        location /recordings {
            root /var;
            add_header Access-Control-Allow-Origin *;
        }
    }
}
```

### 3. Security Group Configuration
**Required ports on EC2**:
- Port 1935 (RTMP)
- Port 80 (HTTP for HLS)
- Port 22 (SSH for maintenance)

### 4. Installation Commands for EC2
```bash
# Install NGINX with RTMP module
sudo apt update
sudo apt install nginx libnginx-mod-rtmp

# Create directories
sudo mkdir -p /var/www/html/hls
sudo mkdir -p /var/recordings
sudo chown -R www-data:www-data /var/www/html/hls
sudo chown -R www-data:www-data /var/recordings

# Enable auto-start
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Frontend Implementation Status

✅ **Fixed Issues**:
1. Stream key display on instructor dashboard
2. RTMP server URL updated to use correct domain
3. Screen recording protection implemented
4. HLS player with security features
5. Real-time stream status detection
6. Webhook handlers for stream events

✅ **Security Features Implemented**:
1. Right-click disabled on video player
2. Screenshot shortcuts blocked (F12, Ctrl+Shift+I, etc.)
3. Screen recording API blocked
4. Text selection disabled on protected content
5. Anti-screenshot overlay on video player

## Testing Workflow

1. **Instructor Creates Stream**:
   - Go to `/instructor-dashboard`
   - Click "New Stream"
   - Enter title/description
   - Stream details appear with RTMP URL and stream key

2. **OBS Configuration**:
   - Settings → Stream
   - Service: Custom
   - Server: `rtmp://stream.haritahive.com/live`
   - Stream Key: (copy from dashboard)

3. **Go Live**:
   - Click "Start Streaming" in OBS
   - Stream automatically appears on `/live-classes`
   - Students see protected video player

4. **End Stream**:
   - Stop streaming in OBS
   - Recording saved to `/var/recordings/`
   - Session marked as ended

## Immediate Actions Required

1. **DNS Setup**: Point `stream.haritahive.com` to `13.60.65.33`
2. **EC2 Configuration**: Install and configure NGINX RTMP
3. **Security Groups**: Open ports 1935 and 80
4. **SSL Certificate**: Add HTTPS support for HLS streaming

## Testing Commands

```bash
# Test RTMP connection
ffmpeg -f lavfi -i testsrc2=duration=10:size=1280x720:rate=30 -f flv rtmp://stream.haritahive.com/live/YOUR_STREAM_KEY

# Test HLS playback
curl -I https://stream.haritahive.com/hls/YOUR_STREAM_KEY.m3u8
```

## Monitoring & Logs

- NGINX logs: `/var/log/nginx/`
- Recordings: `/var/recordings/`
- HLS segments: `/var/www/html/hls/`