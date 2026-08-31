const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pinDir = path.join(root, 'pinterest', '2026-08-31');
fs.mkdirSync(pinDir, { recursive: true });

const colors = {
  forest: '#17372f',
  green: '#25483d',
  cream: '#f8f3e9',
  sage: '#dfe9df',
  gold: '#d2a85f',
  rust: '#a95638',
  muted: '#50645d',
  white: '#ffffff'
};

function lines(items, x, y, size, gap, fill = colors.forest, family = "Georgia, 'Times New Roman', serif", weight = 700) {
  return items.map((line, index) => `<text x="${x}" y="${y + index * gap}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}">${line}</text>`).join('\n');
}

function checklist(x, y, width, items, accent = colors.rust) {
  return items.map((item, index) => {
    const top = y + index * 92;
    return `<rect x="${x}" y="${top}" width="${width}" height="72" rx="20" fill="${colors.white}" opacity="0.96"/>
      <rect x="${x + 24}" y="${top + 20}" width="32" height="32" rx="8" fill="none" stroke="${accent}" stroke-width="5"/>
      <path d="M${x + 31} ${top + 36}l8 8 17-21" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${x + 78}" y="${top + 44}" fill="${colors.green}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">${item}</text>`;
  }).join('\n');
}

function pinSvg({ kicker, title, subtitle, items, accent = colors.rust, dark = false }) {
  const bg = dark ? colors.forest : colors.cream;
  const titleColor = dark ? colors.white : colors.forest;
  const subColor = dark ? colors.sage : colors.muted;
  const cardFill = dark ? '#214b3f' : colors.sage;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500">
    <rect width="1000" height="1500" fill="${bg}"/>
    <rect width="1000" height="24" fill="${colors.gold}"/>
    <circle cx="920" cy="124" r="148" fill="${accent}" opacity="0.16"/>
    <circle cx="70" cy="1040" r="210" fill="${colors.gold}" opacity="0.12"/>
    <rect x="72" y="88" width="420" height="60" rx="30" fill="${accent}"/>
    <text x="282" y="127" text-anchor="middle" fill="${colors.white}" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" letter-spacing="2.5">${kicker}</text>
    ${lines(title, 72, 270, 66, 78, titleColor)}
    <text x="74" y="${320 + title.length * 78}" fill="${subColor}" font-family="Arial, Helvetica, sans-serif" font-size="27">${subtitle}</text>
    <rect x="62" y="${400 + title.length * 78}" width="876" height="${items.length * 92 + 70}" rx="38" fill="${cardFill}"/>
    ${checklist(105, 445 + title.length * 78, 790, items, accent)}
    <rect x="72" y="1330" width="856" height="4" rx="2" fill="${colors.gold}"/>
    <text x="72" y="1405" fill="${titleColor}" font-family="Georgia, 'Times New Roman', serif" font-size="31" font-weight="700">HOME ROUTINE GUIDE</text>
    <text x="928" y="1405" text-anchor="end" fill="${subColor}" font-family="Arial, Helvetica, sans-serif" font-size="22">homeroutineguide.com</text>
    <text x="72" y="1450" fill="${subColor}" font-family="Arial, Helvetica, sans-serif" font-size="20">Practical guidance for new homeowners</text>
  </svg>`;
}

const pins = [
  {
    file: 'home-emergency-kit-checklist',
    kicker: 'FREE CHECKLIST',
    title: ['Home Emergency', 'Kit Checklist'],
    subtitle: 'Start with the supplies that matter most',
    items: ['Water + food', 'Light + communication', 'Medicine + first aid', 'Documents + household needs']
  },
  {
    file: 'new-homeowner-emergency-kit',
    kicker: 'NEW HOMEOWNER',
    title: ['Your First', 'Emergency Kit'],
    subtitle: 'Build it around your actual home and household',
    items: ['Local alerts', 'Home-system outages', 'Children, pets + accessibility', 'A recurring review date'],
    accent: colors.gold,
    dark: true
  },
  {
    file: 'power-outage-supplies-checklist',
    kicker: 'POWER OUTAGE PLAN',
    title: ['Before the', 'Lights Go Out'],
    subtitle: 'Prepare the home without unsafe shortcuts',
    items: ['Flashlights + batteries', 'Chargers + radio', 'Food temperatures', 'Alarm + generator safety'],
    accent: colors.rust
  },
  {
    file: 'emergency-water-and-food-plan',
    kicker: 'PRACTICAL PREPAREDNESS',
    title: ['Plan Water + Food', 'for Several Days'],
    subtitle: 'Use public-health guidance—not guesswork',
    items: ['Safe water storage', 'Shelf-stable food', 'Manual can opener', 'Rotation dates'],
    accent: colors.gold,
    dark: true
  },
  {
    file: 'emergency-documents-checklist',
    kicker: 'PROTECT THE RECORDS',
    title: ['Emergency Contacts', '+ Documents'],
    subtitle: 'Keep the right information accessible and secure',
    items: ['Verified contacts', 'Insurance + property records', 'Protected backups', 'Cash + payment access'],
    accent: colors.rust
  }
];

for (const pin of pins) {
  fs.writeFileSync(path.join(pinDir, `${pin.file}.svg`), pinSvg(pin));
}

const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${colors.cream}"/>
  <rect width="1200" height="18" fill="${colors.forest}"/>
  <circle cx="1090" cy="100" r="175" fill="${colors.gold}" opacity="0.18"/>
  <rect x="64" y="58" width="380" height="55" rx="28" fill="${colors.rust}"/>
  <text x="254" y="94" text-anchor="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" letter-spacing="2">FREE NEW HOMEOWNER GUIDE</text>
  ${lines(['Home Emergency Kit', 'Checklist'], 66, 205, 58, 66)}
  <text x="68" y="365" fill="${colors.muted}" font-family="Arial, Helvetica, sans-serif" font-size="22">Water · food · light · medicine · documents</text>
  <text x="68" y="400" fill="${colors.muted}" font-family="Arial, Helvetica, sans-serif" font-size="22">Pets · alerts · home-specific outage needs</text>
  <text x="68" y="565" fill="${colors.forest}" font-family="Georgia, 'Times New Roman', serif" font-size="27" font-weight="700">HOME ROUTINE GUIDE</text>
  <rect x="770" y="78" width="354" height="468" rx="38" fill="${colors.forest}"/>
  <rect x="825" y="123" width="245" height="330" rx="18" fill="${colors.sage}"/>
  <path d="M1020 123v72h-72" fill="#c3d6c6"/>
  ${checklist(850, 190, 195, ['Water', 'Light', 'Medicine'], colors.rust)}
  <rect x="848" y="475" width="198" height="42" rx="21" fill="${colors.gold}"/>
  <text x="947" y="503" text-anchor="middle" fill="${colors.forest}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">BUILD THE KIT</text>
  <text x="1124" y="583" text-anchor="end" fill="${colors.muted}" font-family="Arial, Helvetica, sans-serif" font-size="18">homeroutineguide.com</text>
</svg>`;

fs.writeFileSync(path.join(root, 'home-emergency-kit-checklist.svg'), social);
