"""Expose only public-page review captures to authenticated log readers.

Artifact ZIP downloads are not supported by every review client. Keep the
standard artifact and provide an exact-byte fallback, limited to these known
public-page screenshots and print PDF. Never add traces or account captures.
"""
import base64
import json
from pathlib import Path

root = Path(__file__).parent / 'test-results'
allowed = {'referral-1280.png', 'referral-390.png', 'referral-print.png',
           'resources-print.pdf'}
for path in sorted(root.rglob('*')):
    if path.is_file() and path.name in allowed:
        data = path.read_bytes()
        if len(data) > 2_000_000:
            raise ValueError('Review capture exceeds expected public-page size')
        print('HRG_REVIEW ' + json.dumps({'name': path.name,
              'base64': base64.b64encode(data).decode('ascii')}))
