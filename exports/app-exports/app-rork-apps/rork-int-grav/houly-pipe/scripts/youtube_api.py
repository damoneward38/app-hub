"""YouTube Data API v3 upload wrapper.

IMPORTANT — service accounts do not work here.
`videos.insert` on a service account fails with `youtubeSignupRequired` /
`unauthorized`, because a service account has no YouTube channel and cannot be
added to one (Brand Accounts only accept Google identities). Uploading requires
a **user** credential from an OAuth "Desktop app" client:

    Google Cloud Console → APIs & Services → Credentials
      → Create credentials → OAuth client ID → Desktop app
      → download as client_secrets.json

The first run opens a browser once and caches the refresh token in token.json;
every run after that is non-interactive, which is what makes CI possible (copy a
pre-authorised token.json into the runner as a secret).

Two quotas worth knowing before you schedule this:
  * An upload costs ~1600 units against a default 10,000/day quota — roughly six
    videos a day until you request more.
  * Projects that have not passed API verification have their uploads forced to
    `private`, whatever `privacyStatus` you send.
"""

from __future__ import annotations

import http.client
import random
import socket
import ssl
import time
from pathlib import Path
from typing import Any, Sequence

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    from googleapiclient.http import MediaFileUpload
    GOOGLE_LIBS_AVAILABLE = True
except ImportError:  # keep the render path usable without the upload extras
    GOOGLE_LIBS_AVAILABLE = False
    HttpError = Exception  # type: ignore[assignment,misc]

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

# 8 MB chunks: small enough to report progress and resume a dropped connection,
# large enough that a 30 GB master does not become 30,000 round trips.
CHUNK_SIZE = 8 * 1024 * 1024

RETRIABLE_STATUS = {500, 502, 503, 504}
RETRIABLE_EXCEPTIONS = (
    http.client.NotConnected, http.client.IncompleteRead, http.client.ImproperConnectionState,
    http.client.CannotSendRequest, http.client.CannotSendHeader,
    http.client.ResponseNotReady, http.client.BadStatusLine,
    ConnectionResetError, socket.timeout, socket.error, ssl.SSLError, OSError,
)
MAX_RETRIES = 8


class UploadError(RuntimeError):
    """Upload failed in a way the operator needs to see."""


class YouTubeUploader:
    """Thin, resumable, retrying wrapper over `videos.insert`."""

    def __init__(self, client_secrets: str | Path, token_path: str | Path = "token.json") -> None:
        if not GOOGLE_LIBS_AVAILABLE:
            raise UploadError(
                "Google API client libraries are missing. "
                "pip install google-api-python-client google-auth-oauthlib"
            )
        self.client_secrets = Path(client_secrets).expanduser()
        self.token_path = Path(token_path).expanduser()
        self._service: Any | None = None

    # ------------------------------------------------------------------ auth
    def _credentials(self) -> Any:
        credentials: Any = None
        if self.token_path.is_file():
            credentials = Credentials.from_authorized_user_file(str(self.token_path), SCOPES)

        if credentials and credentials.valid:
            return credentials

        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            if not self.client_secrets.is_file():
                raise UploadError(
                    f"OAuth client secrets not found at {self.client_secrets}. "
                    "Create a Desktop-app OAuth client and download it there."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(self.client_secrets), SCOPES)
            # port=0 picks a free loopback port; on a headless box this prints a
            # URL you can open anywhere, then paste nothing — it waits on the
            # local redirect, so tunnel the port or authorise on a desktop once
            # and copy token.json over.
            credentials = flow.run_local_server(port=0, open_browser=True)

        self.token_path.write_text(credentials.to_json(), encoding="utf-8")
        self.token_path.chmod(0o600)
        return credentials

    @property
    def service(self) -> Any:
        if self._service is None:
            self._service = build("youtube", "v3", credentials=self._credentials(),
                                  cache_discovery=False)
        return self._service

    # ---------------------------------------------------------------- upload
    def upload(
        self,
        video_path: str | Path,
        title: str,
        description: str = "",
        tags: Sequence[str] | None = None,
        privacy: str = "private",
        category_id: str = "22",
        made_for_kids: bool = False,
    ) -> str:
        """Upload resumably and return the new videoId."""
        path = Path(video_path).expanduser()
        if not path.is_file():
            raise UploadError(f"Video not found: {path}")
        if privacy not in {"public", "private", "unlisted"}:
            raise UploadError(f"privacy must be public/private/unlisted, got {privacy!r}")

        body = {
            "snippet": {
                "title": title[:100],
                "description": description[:5000],
                "tags": list(tags or [])[:500],
                "categoryId": str(category_id),
            },
            "status": {
                "privacyStatus": privacy,
                "selfDeclaredMadeForKids": made_for_kids,
            },
        }

        media = MediaFileUpload(str(path), chunksize=CHUNK_SIZE, resumable=True,
                                mimetype="video/*")
        request = self.service.videos().insert(part="snippet,status", body=body,
                                               media_body=media)

        response: dict[str, Any] | None = None
        attempt = 0
        while response is None:
            try:
                status, response = request.next_chunk()
                if status:
                    print(f"\r  upload {status.progress() * 100:5.1f}%", end="", flush=True)
                attempt = 0
            except HttpError as error:  # type: ignore[misc]
                status_code = getattr(getattr(error, "resp", None), "status", None)
                if status_code in RETRIABLE_STATUS:
                    attempt = self._backoff(attempt, f"HTTP {status_code}")
                    continue
                raise UploadError(f"YouTube rejected the upload: {error}") from error
            except RETRIABLE_EXCEPTIONS as error:
                attempt = self._backoff(attempt, type(error).__name__)
                continue

        print()
        video_id = str(response.get("id", ""))
        if not video_id:
            raise UploadError(f"Upload finished without a videoId: {response}")
        print(f"  ✔ https://youtu.be/{video_id}  ({privacy})")
        return video_id

    def set_thumbnail(self, video_id: str, image_path: str | Path) -> None:
        """Best-effort custom thumbnail — needs a verified channel, so never fatal."""
        path = Path(image_path).expanduser()
        if not path.is_file():
            return
        try:
            self.service.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(str(path), mimetype="image/jpeg"),
            ).execute()
            print("  ✔ thumbnail set")
        except Exception as error:  # noqa: BLE001 - informational only
            print(f"  ! thumbnail skipped ({error})")

    @staticmethod
    def _backoff(attempt: int, reason: str) -> int:
        attempt += 1
        if attempt > MAX_RETRIES:
            raise UploadError(f"Giving up after {MAX_RETRIES} retries ({reason}).")
        delay = min(60.0, (2 ** attempt) + random.random())
        print(f"\n  ! {reason} — retry {attempt}/{MAX_RETRIES} in {delay:.1f}s")
        time.sleep(delay)
        return attempt
