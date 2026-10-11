import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_HEAD(self):
        clean_path = self.path.split('?')[0].split('#')[0]
        if clean_path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        if clean_path in ('/pages/login.html', '/pages/login', '/login'):
            self.send_response(302)
            self.send_header('Location', '/login.html')
            self.end_headers()
            return
        if clean_path in ('/pages/signup.html', '/pages/signup', '/signup'):
            self.send_response(302)
            self.send_header('Location', '/signup.html')
            self.end_headers()
            return
        super().do_HEAD()

    def do_GET(self):
        clean_path = self.path.split('?')[0].split('#')[0]
        if clean_path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        if clean_path in ('/pages/login.html', '/pages/login', '/login'):
            self.send_response(302)
            self.send_header('Location', '/login.html')
            self.end_headers()
            return
        if clean_path in ('/pages/signup.html', '/pages/signup', '/signup'):
            self.send_response(302)
            self.send_header('Location', '/signup.html')
            self.end_headers()
            return
        super().do_GET()

    def translate_path(self, path):
        # Strip query and anchor
        clean_path = path.split('?')[0].split('#')[0]

        # Root resolves to login.html
        if clean_path in ('', '/'):
            clean_path = '/login.html'
        elif clean_path in ('/pages/login.html', '/pages/login', '/login'):
            clean_path = '/login.html'
        elif clean_path in ('/pages/signup.html', '/pages/signup', '/signup'):
            clean_path = '/signup.html'

        # Fix any assets mistakenly requested under /pages/
        if clean_path.startswith('/pages/css/'):
            clean_path = clean_path.replace('/pages/css/', '/css/', 1)
        elif clean_path.startswith('/pages/js/'):
            clean_path = clean_path.replace('/pages/js/', '/js/', 1)
        elif clean_path.startswith('/pages/assets/'):
            clean_path = clean_path.replace('/pages/assets/', '/assets/', 1)

        # Default translation
        translated = super().translate_path(clean_path)

        # If file does not exist, try with .html extension
        if not os.path.exists(translated):
            if os.path.exists(translated + '.html'):
                return translated + '.html'
            # Try within pages/ folder
            rel = clean_path.lstrip('/')
            pages_candidate = os.path.join(DIRECTORY, 'pages', rel)
            if os.path.exists(pages_candidate):
                return pages_candidate
            if os.path.exists(pages_candidate + '.html'):
                return pages_candidate + '.html'

        return translated

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHTTPHandler) as httpd:
        print(f"Server started at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
