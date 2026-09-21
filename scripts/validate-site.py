"""Offline source checks; not a browser, security, or live checkout audit."""
import argparse
import json
import re
import subprocess
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

class Page(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.tags, self.ids, self.scripts, self.script = [], set(), [], None
        self.feed(content)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get('id'): self.ids.add(attrs['id'])
        if tag == 'script': self.script = [attrs, '']
    def handle_data(self, data):
        if self.script is not None: self.script[1] += data
    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.scripts.append(self.script)
            self.script = None

parser = argparse.ArgumentParser()
parser.add_argument('root', nargs='?', default=str(Path(__file__).resolve().parents[1]))
args = parser.parse_args()
root = Path(args.root).resolve()
base = 'https://homeroutineguide.com/'
files = sorted(root.glob('*.html'))
pages = {p.name: Page(p.read_text()) for p in files}
errors, indexable, emails = [], set(), set()
json_blocks = 0
for path in files:
    name, content, page = path.name, path.read_text(), pages[path.name]
    if re.search(r'\$19(?:\.00)?(?!\d|\.\d)', content):
        errors.append(f'{name}: outdated Binder price; expected $9.99')
    metas = {a.get('name'): a.get('content', '') for t, a in page.tags if t == 'meta'}
    canonical = [a.get('href') for t, a in page.tags if t == 'link' and a.get('rel') == 'canonical']
    expected = base if name == 'index.html' else base + name
    if 'noindex' not in metas.get('robots', '').lower():
        indexable.add(expected)
        for ok, label in [
            (canonical == [expected], 'canonical'),
            (sum(t == 'h1' for t, a in page.tags) == 1, 'single H1'),
            (sum(t == 'title' for t, a in page.tags) == 1, 'title'),
            (bool(metas.get('description')), 'description'),
            (bool(metas.get('viewport')), 'viewport'),
            (any(t == 'html' and a.get('lang') == 'en' for t, a in page.tags), 'language'),
            (any(t == 'a' and 'skip-link' in a.get('class', '') for t, a in page.tags), 'skip link'),
        ]:
            if not ok: errors.append(f'{name}: {label}')
    beacon_count = sum(a.get('src', '').startswith('https://static.cloudflareinsights.com/') for t, a in page.tags if t == 'script')
    if beacon_count != (0 if name == 'newsletter-embed.html' else 1): errors.append(f'{name}: beacon count {beacon_count}')
    for attrs, body in page.scripts:
        if attrs.get('type') == 'application/ld+json':
            try: json.loads(body); json_blocks += 1
            except ValueError: errors.append(f'{name}: invalid JSON-LD')
    for tag, attrs in page.tags:
        if tag == 'img' and 'alt' not in attrs: errors.append(f'{name}: missing alt')
        for attr in ('href', 'src'):
            value = attrs.get(attr)
            if not value or value.startswith(('mailto:', 'tel:', 'data:', 'javascript:')): continue
            target = urllib.parse.urlsplit(urllib.parse.urljoin(expected, value))
            if target.netloc != 'homeroutineguide.com': continue
            local = urllib.parse.unquote(target.path).lstrip('/') or 'index.html'
            if not (root / local).is_file(): errors.append(f'{name}: missing {local}'); continue
            if target.fragment and local in pages and target.fragment not in pages[local].ids:
                errors.append(f'{name}: missing fragment {local}#{target.fragment}')
            if tag == 'a' and urllib.parse.urlsplit(value).path.endswith('index.html'):
                errors.append(f'{name}: noncanonical homepage link')
    emails.update(re.findall(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', content))
    if re.search(r'\b(?:\(\d{3}\)\s*\d{3}[-.]\d{4}|\d{3}[-.]\d{3}[-.]\d{4})\b', content): errors.append(f'{name}: phone-like string requires review')

sitemap = {n.text for n in ET.parse(root / 'sitemap.xml').findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
if sitemap != indexable: errors.append(f'sitemap mismatch: {sorted(sitemap ^ indexable)}')
if emails != {'info@homeroutineguide.com'}: errors.append('Unexpected public email')
for file in root.rglob('*.js'):
    if re.search(r'\$19(?:\.00)?(?!\d|\.\d)', file.read_text()):
        errors.append(f'{file.name}: outdated Binder price; expected $9.99')
    check = subprocess.run(['node', '--check', str(file)], capture_output=True, text=True)
    if check.returncode: errors.append(f'{file.name}: JavaScript syntax')

checkout = 'https://home-routine-guide.kit.com/products/19-starter-binder?step=checkout'
product = (root / 'packages.html').read_text()
if checkout not in product or '$9.99' not in product or '44' not in product:
    errors.append('Product offer or checkout destination changed; review required')
print(json.dumps({'html_files': len(files), 'indexable_urls': len(indexable),
                  'jsonld_blocks': json_blocks, 'errors': errors}, indent=2))
sys.exit(bool(errors))
