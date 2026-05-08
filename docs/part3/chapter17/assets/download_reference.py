import json, os, time, sys
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests, subprocess

FFMPEG = r"D:\csshe\AppData\Local\Programs\xiezuo\resources\ffmpeg\ffmpeg.exe"
OUT_DIR = r"D:\GenericAgent\temp\bili_download"
CHUNK = 8 * 1024 * 1024  # 8MB chunks
MAX_EP_PARALLEL = 2  # 2 episodes at a time
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
    'Referer': 'https://www.bilibili.com/',
}

def download_file(url, backup_url, dest, label=""):
    """Chunked download with resume support"""
    if os.path.exists(dest):
        existing = os.path.getsize(dest)
    else:
        existing = 0
    
    # Get total size
    for try_url in [url, backup_url]:
        if not try_url:
            continue
        try:
            h = {**HEADERS, 'Range': f'bytes=0-0'}
            r = requests.get(try_url, headers=h, timeout=15)
            if r.status_code == 206:
                cr = r.headers.get('Content-Range', '')
                total = int(cr.split('/')[-1]) if '/' in cr else 0
                active_url = try_url
                break
        except:
            continue
    else:
        print(f"  [FAIL] Cannot reach any URL for {label}")
        return False
    
    if existing >= total and total > 0:
        print(f"  [SKIP] {label} already complete ({total/1024/1024:.1f}MB)")
        return True
    
    print(f"  [DL] {label}: {total/1024/1024:.1f}MB, resume from {existing/1024/1024:.1f}MB")
    
    retries = 0
    with open(dest, 'ab') as f:
        while existing < total:
            end = min(existing + CHUNK - 1, total - 1)
            h = {**HEADERS, 'Range': f'bytes={existing}-{end}'}
            try:
                r = requests.get(active_url, headers=h, timeout=30, stream=True)
                if r.status_code not in (200, 206):
                    # Try backup
                    if backup_url and active_url != backup_url:
                        active_url = backup_url
                        retries += 1
                        continue
                    print(f"  [ERR] {label} HTTP {r.status_code}")
                    return False
                for chunk in r.iter_content(chunk_size=65536):
                    f.write(chunk)
                    existing += len(chunk)
                retries = 0
            except Exception as e:
                retries += 1
                if retries > 5:
                    print(f"  [FAIL] {label} after 5 retries: {e}")
                    return False
                # Switch URL on failure
                if backup_url and active_url != backup_url:
                    active_url = backup_url
                time.sleep(2)
                continue
            
            pct = existing * 100 / total if total else 0
            sys.stdout.write(f"\r  [{label}] {pct:.0f}% ({existing/1024/1024:.0f}/{total/1024/1024:.0f}MB)")
            sys.stdout.flush()
    
    print(f"\n  [OK] {label} done")
    return True

def merge_av(video_path, audio_path, output_path):
    """Merge video + audio with ffmpeg"""
    if os.path.exists(output_path):
        sz = os.path.getsize(output_path)
        if sz > 1024*1024:
            print(f"  [SKIP] {os.path.basename(output_path)} already merged ({sz/1024/1024:.1f}MB)")
            return True
    cmd = [FFMPEG, '-y', '-i', video_path, '-i', audio_path, '-c', 'copy', '-movflags', '+faststart', output_path]
    r = subprocess.run(cmd, capture_output=True, timeout=120)
    if r.returncode == 0 and os.path.exists(output_path):
        sz = os.path.getsize(output_path)
        print(f"  [MERGE] {os.path.basename(output_path)} OK ({sz/1024/1024:.1f}MB)")
        # Clean up temp files
        os.remove(video_path)
        os.remove(audio_path)
        return True
    else:
        print(f"  [MERGE FAIL] {r.stderr.decode('utf-8','ignore')[-200:]}")
        return False

def download_episode(ep):
    """Download one episode (video + audio) then merge"""
    title = ep['title']
    print(f"\n{'='*50}\n[EP] {title}\n{'='*50}")
    
    video_tmp = os.path.join(OUT_DIR, f"{title}_video.m4s")
    audio_tmp = os.path.join(OUT_DIR, f"{title}_audio.m4s")
    output = os.path.join(OUT_DIR, f"{title}.mp4")
    
    # Check if already done
    if os.path.exists(output) and os.path.getsize(output) > 10*1024*1024:
        print(f"  [SKIP] Already exists ({os.path.getsize(output)/1024/1024:.1f}MB)")
        return True
    
    # Download video and audio in parallel within this episode
    with ThreadPoolExecutor(max_workers=2) as pool:
        fv = pool.submit(download_file, ep['video_url'], ep.get('video_backup'), video_tmp, f"{title}/video")
        fa = pool.submit(download_file, ep['audio_url'], ep.get('audio_backup'), audio_tmp, f"{title}/audio")
        vok = fv.result()
        aok = fa.result()
    
    if not (vok and aok):
        print(f"  [FAIL] {title} download incomplete")
        return False
    
    return merge_av(video_tmp, audio_tmp, output)

def main():
    with open(os.path.join(OUT_DIR, "all_episodes.json"), "r", encoding="utf-8") as f:
        data = json.loads(f.read())
    
    episodes = data['episodes']
    total = sum((e.get('video_size',0)+e.get('audio_size',0)) for e in episodes)
    print(f"Total: {len(episodes)} episodes, {total/1024/1024/1024:.2f}GB")
    print(f"Concurrency: {MAX_EP_PARALLEL} episodes, video+audio parallel within each")
    print(f"Output: {OUT_DIR}\n")
    
    t0 = time.time()
    results = {}
    
    # Process in batches of MAX_EP_PARALLEL
    for i in range(0, len(episodes), MAX_EP_PARALLEL):
        batch = episodes[i:i+MAX_EP_PARALLEL]
        with ThreadPoolExecutor(max_workers=MAX_EP_PARALLEL) as pool:
            futures = {pool.submit(download_episode, ep): ep['title'] for ep in batch}
            for fut in as_completed(futures):
                title = futures[fut]
                try:
                    results[title] = fut.result()
                except Exception as e:
                    results[title] = False
                    print(f"  [ERROR] {title}: {e}")
    
    elapsed = time.time() - t0
    ok = sum(1 for v in results.values() if v)
    print(f"\n{'='*50}")
    print(f"Done: {ok}/{len(episodes)} episodes in {elapsed:.0f}s")
    print(f"Speed: {total/1024/1024/elapsed:.1f}MB/s avg" if elapsed > 0 else "")
    for title, success in results.items():
        print(f"  {'✓' if success else '✗'} {title}")

if __name__ == '__main__':
    main()