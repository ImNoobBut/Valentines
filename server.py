#!/usr/bin/env python3
"""
Secure HTTP Server for Valentine's Invitation App
Handles photo uploads and invitation creation
Configured for deployment on Render.com
"""

import http.server
import socketserver
import os
import json
import uuid
import base64
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Get port from environment variable (Render sets this) or default to 8000
PORT = int(os.getenv('PORT', 8000))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = Path(DIRECTORY) / '.uploads'
UPLOADS_DIR.mkdir(exist_ok=True)
INVITATIONS_DIR = Path(DIRECTORY) / '.invitations'
INVITATIONS_DIR.mkdir(exist_ok=True)

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add security headers to prevent path exposure
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Access-Control-Allow-Origin', '*')
        # Allow inline styles/scripts and data: images for the floating photos
        self.send_header(
            'Content-Security-Policy',
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: http://localhost:8000;"
        )
        super().end_headers()
    
    def do_GET(self):
        # API: Get photo by ID
        if self.path.startswith('/api/photo/'):
            photo_id = self.path.split('/')[-1]
            self.handle_get_photo(photo_id)
            return
        
        # API: Get invitation by token
        if self.path.startswith('/api/invitation/'):
            token = self.path.split('/')[-1].split('?')[0]
            self.handle_get_invitation(token)
            return
        
        # Prevent directory listing
        if self.path in ['/', '']:
            self.path = '/index.html'
        
        # Serve files normally
        if os.path.isdir(self.translate_path(self.path)):
            self.send_error(403, "Directory listing is disabled")
            return
        
        super().do_GET()
    
    def do_POST(self):
        # API: Upload photo
        if self.path == '/api/upload-photo':
            self.handle_upload_photo()
            return
        
        # API: Create invitation
        if self.path == '/api/create-invitation':
            self.handle_create_invitation()
            return
        
        self.send_error(404, "Not Found")
    
    def handle_upload_photo(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Get the boundary from Content-Type header
            content_type = self.headers.get('Content-Type', '')
            boundary = None
            if 'boundary=' in content_type:
                boundary = content_type.split('boundary=')[1].split(';')[0].strip('"')
            
            # Parse multipart form data
            if boundary:
                photo_data = self.extract_multipart_photo(body, boundary)
            else:
                # If no boundary, assume raw data
                photo_data = body
            
            if not photo_data:
                self.send_error(400, "No photo data found")
                return
            
            # Generate a unique photo ID
            photo_id = str(uuid.uuid4())[:12]
            photo_file = UPLOADS_DIR / f"{photo_id}.jpg"
            
            # Save the photo
            with open(photo_file, 'wb') as f:
                f.write(photo_data)
            
            # Return the photo ID
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = json.dumps({'photoId': photo_id})
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            self.send_error(400, f"Error uploading photo: {str(e)}")
    
    def extract_multipart_photo(self, body, boundary):
        """Extract photo data from multipart form data"""
        try:
            # Split by boundary
            parts = body.split(f'--{boundary}'.encode())
            for part in parts:
                if b'Content-Type: image/' in part:
                    # Extract image data (after headers and blank line)
                    data_start = part.find(b'\r\n\r\n')
                    if data_start != -1:
                        data_start += 4
                        # Remove trailing boundary marker
                        data_end = part.rfind(b'\r\n')
                        if data_end > data_start:
                            return part[data_start:data_end]
            return None
        except:
            return None
    
    def handle_create_invitation(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            data = json.loads(body)
            token = str(uuid.uuid4())[:12]
            
            # Save invitation metadata
            invitation_file = INVITATIONS_DIR / f"{token}.json"
            with open(invitation_file, 'w') as f:
                json.dump(data, f)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = json.dumps({'token': token})
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            self.send_error(400, f"Error: {str(e)}")
    
    def handle_get_invitation(self, token):
        invitation_file = INVITATIONS_DIR / f"{token}.json"
        
        if not invitation_file.exists():
            self.send_error(404, "Invitation not found")
            return
        
        try:
            with open(invitation_file, 'r') as f:
                data = json.load(f)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode('utf-8'))
            
        except Exception as e:
            self.send_error(500, f"Error: {str(e)}")
    
    def handle_get_photo(self, photo_id):
        photo_file = UPLOADS_DIR / f"{photo_id}.jpg"
        
        if not photo_file.exists():
            self.send_error(404, "Photo not found")
            return
        
        try:
            with open(photo_file, 'rb') as f:
                photo_data = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', 'image/jpeg')
            self.send_header('Content-Length', str(len(photo_data)))
            self.end_headers()
            self.wfile.write(photo_data)
            
        except Exception as e:
            self.send_error(500, f"Error: {str(e)}")
    
    def log_message(self, format, *args):
        # Suppress detailed logging to prevent path exposure in logs
        if '200' in format or '304' in format:
            print(f'[{self.client_address[0]}] {args[0]}')
        else:
            print(f'[{self.client_address[0]}] Error: {format % args}')

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    handler = SecureHTTPRequestHandler
    with socketserver.TCPServer(('0.0.0.0', PORT), handler) as httpd:
        print(f'Server running on port {PORT}')
        print('Listening on all interfaces (0.0.0.0)')
        httpd.serve_forever()
