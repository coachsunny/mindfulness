import asyncio
import os
import re
import sys
import glob
import edge_tts

# Microsoft Neural Standard Mandarin Wise Elder Male Voice
VOICE = "zh-CN-YunjianNeural"
RATE = "-22%"
PITCH = "-6Hz"

def parse_front_matter_regex(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    match = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n", content, re.DOTALL)
    if not match:
        return None
    fm = match.group(1)
    week_match = re.search(r'^week:\s*["\']?(\d+)["\']?', fm, re.MULTILINE)
    if not week_match:
        return None
    week = week_match.group(1).zfill(2)

    # Extract guidance_script block
    gs_match = re.search(r'^guidance_script:\s*\r?\n((?:[ \t]+.*\r?\n?)+)', fm, re.MULTILINE)
    if not gs_match:
        return None
    gs_block = gs_match.group(1)
    texts = re.findall(r'text:\s*["\'](.*?)["\']\s*$', gs_block, re.MULTILINE)
    return {
        "week": week,
        "texts": texts
    }

async def generate_for_post(filepath, root_dir, force=False):
    meta = parse_front_matter_regex(filepath)
    if not meta or not meta["texts"]:
        return
    week_str = f"week{meta['week']}"
    out_dir = os.path.join(root_dir, "assets", "audio", week_str)
    os.makedirs(out_dir, exist_ok=True)

    texts = meta["texts"]
    print(f"[{week_str}] Checking/generating {len(texts)} Mandarin elder voice cues ({VOICE})...")
    for idx, raw_text in enumerate(texts):
        out_path = os.path.join(out_dir, f"cue-{idx}.mp3")
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000 and not force:
            print(f"  [Skip existing] {out_path}")
            continue
        # Clean quotation marks and add extra breathing space at sentence breaks
        clean_text = re.sub(r"[「」“”『』\"]", "", raw_text)
        clean_text = re.sub(r"([。；！…？?]+)", r"\1 ， ", clean_text)
        communicate = edge_tts.Communicate(clean_text, VOICE, rate=RATE, pitch=PITCH)
        await communicate.save(out_path)
        print(f"  [Saved] {out_path}")

async def main():
    force = "--force" in sys.argv
    root_dir = r"d:\正念療愈"
    posts = sorted(glob.glob(os.path.join(root_dir, "_posts", "*.md")))
    for p in posts:
        await generate_for_post(p, root_dir, force=force)

if __name__ == "__main__":
    asyncio.run(main())
