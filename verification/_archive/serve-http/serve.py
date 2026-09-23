#!/usr/bin/env python3
import http.server, socketserver, os
PORT = 8765
DIR = r"D:\AI\MiniMax_space\A9.19\fanqie-novel-bypass\verification"
os.chdir(DIR)
class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
    def log_message(self, fmt, *args):
        print('[serve]', fmt % args)
with socketserver.TCPServer(('127.0.0.1', PORT), Handler) as httpd:
    print(f'Serving {DIR} on http://127.0.0.1:{PORT}/')
    httpd.serve_forever()