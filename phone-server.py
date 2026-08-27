from __future__ import annotations

import argparse
import mimetypes
import os
import shutil
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit


def is_inside(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


class PhoneHandler(BaseHTTPRequestHandler):
    server_version = "HuiLaiShiPhone/11.0"

    def do_HEAD(self) -> None:
        self._route(send_body=False)

    def do_GET(self) -> None:
        self._route(send_body=True)

    def _route(self, send_body: bool) -> None:
        raw_path = urlsplit(self.path).path
        path = unquote(raw_path)
        if "\x00" in path:
            self.send_error(400)
            return

        if path == "/download/android":
            self._send_file(self.server.single_file, send_body, download_name="萨瓦迪卡-手机离线版.html")
            return
        if path == "/download/package":
            if not self.server.package_file.exists():
                self.send_error(404, "Package is not available")
                return
            self._send_file(self.server.package_file, send_body, download_name="萨瓦迪卡-V12-完整包.zip")
            return
        if path == "/thai-vibe-app":
            self.send_response(308)
            self.send_header("Location", "/thai-vibe-app/")
            self.end_headers()
            return
        if path.startswith("/thai-vibe-app/"):
            relative = path[len("/thai-vibe-app/") :] or "index.html"
            candidate = (self.server.app_root / relative).resolve()
            if not is_inside(candidate, self.server.app_root) or not candidate.is_file():
                self.send_error(404)
                return
            self._send_file(candidate, send_body)
            return
        self.send_error(404)

    def _send_file(self, path: Path, send_body: bool, download_name: str | None = None) -> None:
        if not path.is_file():
            self.send_error(404)
            return
        size = path.stat().st_size
        self.send_response(200)
        if download_name:
            ascii_name = "sawatdee-offline.html" if path.suffix.lower() == ".html" else "sawatdee-v12.zip"
            encoded_name = quote(download_name, safe="")
            self.send_header("Content-Type", "application/octet-stream")
            self.send_header("Content-Disposition", f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{encoded_name}")
            self.send_header("Cache-Control", "no-store")
        else:
            mime, _ = mimetypes.guess_type(path.name)
            self.send_header("Content-Type", mime or "application/octet-stream")
            self.send_header("Cache-Control", "no-cache" if path.suffix.lower() in {".html", ".js", ".css"} else "public, max-age=86400")
        self.send_header("Content-Length", str(size))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        if send_body:
            with path.open("rb") as source:
                shutil.copyfileobj(source, self.wfile)

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[{self.address_string()}] {fmt % args}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--app-root", type=Path, required=True)
    parser.add_argument("--single-file", type=Path, required=True)
    parser.add_argument("--package-file", type=Path, required=True)
    args = parser.parse_args()

    app_root = args.app_root.resolve()
    single_file = args.single_file.resolve()
    package_file = args.package_file.resolve()
    if not (app_root / "index.html").is_file() or not single_file.is_file():
        raise SystemExit("App shell or offline single file is missing")

    server = ThreadingHTTPServer(("0.0.0.0", args.port), PhoneHandler)
    server.app_root = app_root
    server.single_file = single_file
    server.package_file = package_file
    # Keep startup output ASCII-only so redirected Windows consoles using a
    # legacy code page cannot crash the server before it begins serving.
    print(f"HuiLaiShi phone server listening on 0.0.0.0:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
