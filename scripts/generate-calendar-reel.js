// Original repository-native vector cards, rasterized with sharp.
// Run with NODE_PATH pointing to the existing sharp runtime, then the ffmpeg command in README.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dir = path.resolve(__dirname, '../social/2026-09-30');
fs.mkdirSync(dir, {recursive:true});
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const text = (x,y,s,size=46,bold=false) => `<text x="${x}" y="${y}" font-family="DejaVu Sans" font-size="${size}" font-weight="${bold?'bold':'normal'}" fill="#17372f">${escape(s)}</text>`;
const scenes = [
  {title:['Too many home','maintenance','checklists?'],lines:['Start with ONE verified task.','Build your plan from there.'],note:['A plan for your actual home.','No universal chore list.']},
  {title:['Find the right','instructions','first.'],lines:['Your equipment manual.','Your qualified service provider.'],note:['Verify what applies and when.','Use qualified help when needed.']},
  {title:['Write three','useful details.'],lines:['WHAT: the verified task','WHEN: the due date','WHO: the responsible person'],note:['Record completed work separately.','Keep household details private.']},
  {title:['Print your free','12-month','calendar.'],lines:['homeroutineguide.com','Tap “Print the free calendar”.'],note:['No signup. Entries are not saved.','Print blank or save your own PDF.']}
];
(async()=>{
  for(let i=0;i<scenes.length;i++) {
    const s=scenes[i]; let b=text(100,275,'HOME ROUTINE GUIDE',29,true);
    b+=text(100,365,`${i+1} / 4  ·  START SMALL`,25,true);
    s.title.forEach((line,j)=>b+=text(100,520+j*94,line,70,true));
    b+='<rect x="90" y="850" width="870" height="340" rx="24" fill="#e2eadf"/>';
    s.lines.forEach((line,j)=>b+=text(120,945+j*80,line,39,true));
    s.note.forEach((line,j)=>b+=text(100,1300+j*56,line,33));
    b+='<path d="M100 1450H920" stroke="#bd9555" stroke-width="4"/>';
    b+=text(100,1530,'homeroutineguide.com',34,true);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#faf7ef"/>${b}</svg>`;
    fs.writeFileSync(path.join(dir,`scene-${i+1}.svg`),svg);
    await sharp(Buffer.from(svg)).png().toFile(path.join(dir,`scene-${i+1}.png`));
  }
})();
