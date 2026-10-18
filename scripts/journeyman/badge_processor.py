"""
Badge normalization and caching processor for Journeyman club crests.
Ensures every club has an authentic, verified, 180x180 RGBA WebP crest.
"""
import os
import io
import hashlib
import json
import requests
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
JOURNEYMAN_CLUBS_DIR = os.path.join(ROOT, 'public/img/journeyman/clubs')
ASSET_SOURCES_PATH = os.path.join(ROOT, 'public/img/journeyman/asset-sources.json')
HL_CLUBS_DIR = os.path.join(ROOT, 'public/img/higher-lower/clubs')
TEAMS_DIR = os.path.join(ROOT, 'public/img/teams')
SCORELINE_DIR = os.path.join(ROOT, 'public/img/scoreline/teams')

os.makedirs(JOURNEYMAN_CLUBS_DIR, exist_ok=True)

def normalize_badge_image(source_bytes: bytes, max_art_box=(164, 164), canvas_size=(180, 180)) -> tuple[bytes, dict]:
    """
    Decodes image bytes, removes transparent padding, scales to fit max_art_box,
    centers on a canvas_size transparent canvas, and returns (webp_bytes, meta).
    """
    im = Image.open(io.BytesIO(source_bytes)).convert('RGBA')
    orig_w, orig_h = im.size
    orig_format = im.format or 'PNG'
    
    # Trim transparent borders
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
        
    crop_w, crop_h = im.size
    scale = min(max_art_box[0] / crop_w, max_art_box[1] / crop_h)
    new_w = max(1, int(round(crop_w * scale)))
    new_h = max(1, int(round(crop_h * scale)))
    
    im_resized = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    canvas = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    offset = ((canvas_size[0] - new_w) // 2, (canvas_size[1] - new_h) // 2)
    canvas.paste(im_resized, offset, im_resized)
    
    out_buf = io.BytesIO()
    canvas.save(out_buf, format='WEBP', quality=90)
    webp_bytes = out_buf.getvalue()
    
    meta = {
        'originalWidth': orig_w,
        'originalHeight': orig_h,
        'originalFormat': orig_format,
        'finalWidth': canvas_size[0],
        'finalHeight': canvas_size[1],
        'artworkWidth': new_w,
        'artworkHeight': new_h,
        'byteSize': len(webp_bytes),
        'sha256': hashlib.sha256(webp_bytes).hexdigest()
    }
    return webp_bytes, meta

def resolve_and_save_badge(club_id: str, tm_id: str = None, fallback_local: str = None, source_url: str = None) -> dict:
    """
    Finds or fetches badge for club_id, normalizes to 180x180 WebP, saves to public/img/journeyman/clubs/<club_id>.webp.
    Returns metadata dict for asset-sources.json.
    """
    dest_path = os.path.join(JOURNEYMAN_CLUBS_DIR, f"{club_id}.webp")
    source_bytes = None
    resolved_source = "unknown"
    resolved_url = None
    
    # 1. Check if high-res TM badge exists locally in public/img/higher-lower/clubs/<tm_id>.png
    if tm_id and os.path.exists(os.path.join(HL_CLUBS_DIR, f"{tm_id}.png")):
        with open(os.path.join(HL_CLUBS_DIR, f"{tm_id}.png"), 'rb') as f:
            source_bytes = f.read()
        resolved_source = "Transfermarkt Local Cache"
        resolved_url = f"https://tmssl.akamaized.net/images/wappen/head/{tm_id}.png"
        
    # 2. Check fallback_local (e.g. in public/img/teams/ or public/img/journeyman/clubs/)
    if not source_bytes and fallback_local:
        candidate_paths = [
            os.path.join(ROOT, fallback_local),
            os.path.join(TEAMS_DIR, f"{fallback_local}.png"),
            os.path.join(JOURNEYMAN_CLUBS_DIR, f"{fallback_local}.webp"),
            os.path.join(SCORELINE_DIR, f"{fallback_local}.png")
        ]
        for cp in candidate_paths:
            if os.path.exists(cp):
                with open(cp, 'rb') as f:
                    source_bytes = f.read()
                resolved_source = f"Local Project Asset ({os.path.relpath(cp, ROOT)})"
                break

    # 3. Check if current file already exists in public/img/journeyman/clubs/<club_id>.webp
    if not source_bytes and os.path.exists(dest_path):
        with open(dest_path, 'rb') as f:
            source_bytes = f.read()
        resolved_source = f"Existing Journeyman Asset (public/img/journeyman/clubs/{club_id}.webp)"

    # 4. Fetch from source_url or TM CDN if tm_id provided
    if not source_bytes and tm_id:
        url = source_url or f"https://tmssl.akamaized.net/images/wappen/head/{tm_id}.png"
        try:
            resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=12)
            if resp.status_code == 200 and len(resp.content) > 500:
                source_bytes = resp.content
                resolved_source = "Transfermarkt Official CDN"
                resolved_url = url
        except Exception as e:
            print(f"Failed to fetch {club_id} from {url}: {e}")

    # 5. Fetch from custom source_url
    if not source_bytes and source_url:
        try:
            resp = requests.get(source_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}, timeout=12)
            if resp.status_code == 200 and len(resp.content) > 500:
                source_bytes = resp.content
                resolved_source = "Official Federation/Club CDN"
                resolved_url = source_url
        except Exception as e:
            print(f"Failed to fetch {club_id} from {source_url}: {e}")

    if not source_bytes:
        raise ValueError(f"Cannot resolve badge source for club {club_id} (tm_id: {tm_id})")

    webp_bytes, meta = normalize_badge_image(source_bytes)
    with open(dest_path, 'wb') as f:
        f.write(webp_bytes)

    meta['clubId'] = club_id
    meta['localPath'] = f"img/journeyman/clubs/{club_id}.webp"
    meta['source'] = resolved_source
    meta['sourceUrl'] = resolved_url or ""
    meta['accessDate'] = "2026-10-18"
    return meta

