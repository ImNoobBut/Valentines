#!/usr/bin/env python3
"""
Secure HTTP Server for Valentine's Invitation App
Prevents directory listing and adds security headers
"""

import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add security headers to prevent path exposure
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'no-referrer')
        # Allow inline styles/scripts and data: images for the floating photos
        self.send_header(
            'Content-Security-Policy',
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:;"
        )
        super().end_headers()
    
    def do_GET(self):
        # Prevent directory listing
        if self.path in ['/', '']:
            self.path = '/index.html'
        
        # Serve files normally
        if os.path.isdir(self.translate_path(self.path)):
            self.send_error(403, "Directory listing is disabled")
            return
        
        super().do_GET()
    
    def log_message(self, format, *args):
        # Suppress detailed logging to prevent path exposure in logs
        if '200' in format or '304' in format:
            print(f'[{self.client_address[0]}] {args[0]}')
        else:
            print(f'[{self.client_address[0]}] Error: {format % args}')

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    handler = SecureHTTPRequestHandler
    with socketserver.TCPServer(('', PORT), handler) as httpd:
        print(f'Server running at http://localhost:{PORT}/')
        print('Press Ctrl+C to stop the server')
        httpd.serve_forever()
