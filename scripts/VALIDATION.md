# Website source validation

Run `python3 scripts/validate-site.py` from the repository root. Python 3 and Node.js must be installed. No third-party Python dependencies or live network requests are used.

The GitHub workflow runs on pull requests, pushes to main, and manual dispatch with read-only repository permissions. It does not publish the website or contact indexing services.

Checks cover root HTML metadata, canonical URLs, sitemap equality, internal file and fragment targets, image alt attributes, JSON-LD parsing, JavaScript syntax, analytics beacon placement, the approved public email address, phone-like strings, and the current product link/price/page-count markers.

These are source checks, not proof of complete accessibility, factual correctness, absence of all personal information, visual quality, or working live checkout. Continue desktop/mobile browser review and production verification before release. The workflow does not become a required merge gate unless repository rules are configured separately.

If the approved product offer changes, update its source assertions as part of that reviewed change. Do not remove checks merely to make a failure pass.
