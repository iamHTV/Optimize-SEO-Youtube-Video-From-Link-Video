# -*- coding: utf-8 -*-
"""Fetch a YouTube transcript and save it to a deterministic UTF-8 file."""

import argparse
import json
import os
import socket
import sys
import time
import re
from multiprocessing import Process, Queue
from youtube_transcript_api import YouTubeTranscriptApi


def extract_video_id(input_str):
    """Trích xuất video ID từ URL hoặc trả về trực tiếp nếu là ID"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/shorts/|youtube\.com/embed/)([a-zA-Z0-9_-]{11})',
        r'([a-zA-Z0-9_-]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, input_str)
        if match:
            return match.group(1)
    return input_str.strip()


def get_transcript(video_id, languages=None, quiet=False):
    """Lấy transcript từ video"""
    if languages is None:
        languages = ['vi', 'en']

    api = YouTubeTranscriptApi()

    transcript_text = None
    used_lang = None
    errors = []

    for lang in languages:
        try:
            start = time.time()
            transcript = api.fetch(video_id, languages=[lang])
            parts = list(transcript)
            text = ' '.join([p.text for p in parts])
            elapsed = time.time() - start

            transcript_text = text
            used_lang = lang
            if not quiet:
                print(f"[OK] Got {lang} transcript in {elapsed:.2f}s ({len(text)} chars)")
            break
        except Exception as e:
            message = f"{lang}: {str(e)[:160]}"
            errors.append(message)
            if not quiet:
                print(f"[FAIL] {message}")

    return transcript_text, used_lang, errors


def transcript_worker(queue, video_id, languages):
    try:
        text, lang, errors = get_transcript(video_id, languages, quiet=True)
        queue.put({"text": text, "lang": lang, "errors": errors})
    except Exception as exc:
        queue.put({"text": None, "lang": None, "errors": [str(exc)]})


def get_transcript_with_timeout(video_id, languages, timeout):
    queue = Queue()
    process = Process(target=transcript_worker, args=(queue, video_id, languages))
    process.start()
    process.join(timeout)

    if process.is_alive():
        process.terminate()
        process.join(3)
        return None, None, [f"Transcript fetch timed out after {timeout}s"]

    if not queue.empty():
        result = queue.get()
        return result.get("text"), result.get("lang"), result.get("errors", [])

    return None, None, ["Transcript fetch failed without a result"]


def parse_args():
    parser = argparse.ArgumentParser(description="Fetch YouTube transcript to a UTF-8 text file.")
    parser.add_argument("video", help="YouTube URL or 11-character video ID")
    parser.add_argument("languages", nargs="*", default=None, help="Language priority, e.g. vi en")
    parser.add_argument("--output-dir", default=".", help="Directory for transcript output")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON status")
    parser.add_argument("--timeout", type=int, default=15, help="Network timeout in seconds")
    return parser.parse_args()


def main():
    args = parse_args()
    socket.setdefaulttimeout(args.timeout)
    languages = args.languages or ['vi', 'en']

    video_id = extract_video_id(args.video)
    os.makedirs(args.output_dir, exist_ok=True)
    output_file = os.path.abspath(os.path.join(args.output_dir, f"transcript_{video_id}.txt"))

    if not args.json:
        print(f"Video ID: {video_id}")
        print(f"Languages: {languages}")
        print(f"Output: {output_file}")
        print("-" * 50)

    if args.timeout and args.timeout > 0:
        text, lang, errors = get_transcript_with_timeout(video_id, languages, args.timeout)
    else:
        text, lang, errors = get_transcript(video_id, languages, quiet=args.json)

    if text:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(text)
        result = {
            "ok": True,
            "video_id": video_id,
            "language": lang,
            "chars": len(text),
            "output_file": output_file,
            "errors": errors,
        }
        if args.json:
            print(json.dumps(result, ensure_ascii=False))
        else:
            print(f"[OK] Transcript saved ({len(text)} chars): {output_file}")
    else:
        result = {
            "ok": False,
            "video_id": video_id,
            "output_file": None,
            "errors": errors or ["No transcript found"],
        }
        if args.json:
            print(json.dumps(result, ensure_ascii=False))
        else:
            print("No transcript found")
        sys.exit(2)

if __name__ == "__main__":
    main()
