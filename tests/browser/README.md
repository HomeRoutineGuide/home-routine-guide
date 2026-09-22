# Website browser checks

These checks run in the existing GitHub Actions validation workflow on the exact checked-out PR or main revision. They exercise desktop (1280px), mobile (390px), and print rendering, including the referral anchor, free-log destination, menu, product link and $9.99 offer. Screenshots and the print PDF are retained as review artifacts for seven days.

Run `npm ci --ignore-scripts --no-audit --no-fund`, `npx playwright install --with-deps chromium`, then `npm test` in this directory. The test server binds to loopback inside the test runner. Tests allow the local site and public Google Fonts; other external requests are blocked so test runs do not generate real analytics or submit account data. Live Kit checkout and newsletter service availability require a separate production check.

This is a focused regression gate, not a comprehensive accessibility, security, performance, or device certification. Review the rendered evidence before merging layout changes. The workflow uses the existing read-only permission and no account credentials.

The job also emits the exact bytes of four allowlisted public-page review captures in its log for clients that cannot download artifact ZIPs. This does not include traces, live account pages, form entries, or private data. Do not broaden that allowlist to authenticated/customer pages.

Implementation reference: https://playwright.dev/docs/ci-intro, reviewed September 22, 2026.
