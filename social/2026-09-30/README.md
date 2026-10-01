# One-task calendar Reel

Prepared September 30, 2026. A 24-second, 1080×1920 text-led Reel testing a different format from the existing still-image campaign. Preparation is not publication or evidence of traffic. Intended slot: October 6, 2026, 10:00 America/New_York, subject to a fresh queue check.

## Caption

Overwhelmed by home-maintenance checklists? Start with one task you can verify.

1. Find the instructions for your actual equipment or ask the appropriate qualified service provider.
2. Write the task, due date and who handles it.
3. Record completed work in a separate maintenance log.

Use the free 12-month calendar at homeroutineguide.com. Tap “Print the free calendar” on the homepage. No signup required. Entries are not saved or submitted; print a blank copy or save your own PDF before leaving.

This is planning help, not a home inspection. Follow equipment instructions and local requirements; use qualified help for technical work. Keep completed household records private.

#NewHomeowner #HomeMaintenance #HomeOrganization

## Destination and accessibility

- https://homeroutineguide.com/home-maintenance-calendar-printable.html#calendar-worksheet
- All information appears as high-contrast on-screen text, repeated in the caption. There is no narration or music; the AAC track is silent. Reels do not support separate image alt text through Metricool.
- Original vector title cards, not photographs, product mockups or a representation of hands-on testing. No generated photorealism, synthetic voice or personal information.
- The four scene SVG/PNG files are the exact visual sources; the MP4 uses six seconds per scene at 30 fps, H.264/yuv420p with an AAC audio track and fast-start metadata.

## Production

Run `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node scripts/generate-calendar-reel.js` using the existing sharp runtime. Build an ffmpeg concat list of scene-1.png through scene-4.png, each with duration 6 and a repeated final frame. Encode using:

```sh
ffmpeg -f concat -safe 0 -i frames.txt -f lavfi -i anullsrc=r=48000:cl=stereo -t 24 -vf 'fps=30,format=yuv420p' -c:v libx264 -preset medium -crf 23 -g 60 -flags +cgop -c:a aac -b:a 128k -movflags +faststart -use_editlist 0 one-task-calendar-reel.mp4
```

Publishing references reviewed September 30, 2026:
- https://help.metricool.com/schedule-and-post-on-instagram-6b6q5
- https://help.metricool.com/publishing-requirements-for-images-and-videos-from-metricool-vfc8n

Website discovery reference: https://developers.google.com/search/docs/crawling-indexing/links-crawlable

Evaluate actual published status, reach/views and website referrals after publication. A scheduling success does not establish reach or sales. No ads, outreach or spending are part of this test.
