type PresetObject = Record<string, any>;

export interface DesignPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  json: string;
  thumbnailUrl: string;
  previewPhotoUrl?: string;
  isPro: false;
  category: "social" | "business" | "video" | "documents" | "seasonal";
  keywords: string[];
}

const ASSET_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/design-assets`;
const DESIGN_IMAGES = {
  interior: `${ASSET_BASE}/interior-living-room.jpg`,
  food: `${ASSET_BASE}/fresh-vegetables.jpg`,
  podcast: `${ASSET_BASE}/podcast-studio.jpg`,
  beach: `${ASSET_BASE}/tropical-beach.jpg`,
  football: `${ASSET_BASE}/football-stadium.jpg`,
  skincare: `${ASSET_BASE}/skincare-product.jpg`,
  cafe: `${ASSET_BASE}/cafe-lifestyle.jpg`,
  halloween: `${ASSET_BASE}/halloween-pumpkin.jpg`,
  christmas: `${ASSET_BASE}/christmas-gifts.jpg`,
  fireworks: `${ASSET_BASE}/new-year-fireworks.jpg`,
  valentine: `${ASSET_BASE}/valentine-flowers.jpg`,
  fashion: `${ASSET_BASE}/street-fashion.jpg`,
  fitness: `${ASSET_BASE}/fitness-training.jpg`,
  cake: `${ASSET_BASE}/celebration-cake.jpg`,
};

const rect = (name: string, left: number, top: number, width: number, height: number, fill: string, radius = 0): PresetObject => ({
  type: "rect", version: "5.3.0", name, left, top, width, height, fill,
  originX: "left", originY: "top", scaleX: 1, scaleY: 1, angle: 0,
  strokeWidth: 0, rx: radius, ry: radius, visible: true,
});

const circle = (name: string, left: number, top: number, radius: number, fill: string): PresetObject => ({
  type: "circle", version: "5.3.0", name, left, top, radius, width: radius * 2, height: radius * 2, fill,
  originX: "left", originY: "top", scaleX: 1, scaleY: 1, angle: 0,
  strokeWidth: 0, visible: true,
});

const photo = (
  name: string,
  src: string,
  sourceWidth: number,
  sourceHeight: number,
  left: number,
  top: number,
  width: number,
  height: number,
): PresetObject => ({
  type: "image", version: "5.3.0", name, src, crossOrigin: "anonymous",
  left, top, width: sourceWidth, height: sourceHeight,
  scaleX: width / sourceWidth, scaleY: height / sourceHeight,
  originX: "left", originY: "top", angle: 0, opacity: 1, visible: true,
});

const text = (
  name: string,
  value: string,
  left: number,
  top: number,
  width: number,
  fontSize: number,
  fill: string,
  fontFamily = "Inter",
  fontWeight: string | number = 700,
  align: "left" | "center" | "right" = "left",
): PresetObject => ({
  type: "textbox", version: "5.3.0", name, text: value, left, top, width,
  height: Math.ceil(fontSize * 1.25 * Math.max(1, value.split("\n").length)),
  fixedHeight: Math.ceil(fontSize * 1.25 * Math.max(1, value.split("\n").length)),
  fill, fontFamily, fontSize, fontWeight, textAlign: align, lineHeight: 1.05,
  styles: [],
  originX: "left", originY: "top", scaleX: 1, scaleY: 1, angle: 0,
  charSpacing: 0, strokeWidth: 0, visible: true,
});

const workspace = (width: number, height: number, fill: string) => ({
  ...rect("clip", 0, 0, width, height, fill),
  selectable: false,
  evented: false,
  hasControls: false,
});

const escapeXml = (value: unknown) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const previewDataUrl = (width: number, height: number, objects: PresetObject[], hasPhoto: boolean) => {
  const content = objects.map((object) => {
    if (hasPhoto && object.name === "clip") return "";
    if (object.type === "rect") {
      return `<rect x="${object.left}" y="${object.top}" width="${object.width}" height="${object.height}" rx="${object.rx || 0}" fill="${escapeXml(object.fill)}"/>`;
    }
    if (object.type === "circle") {
      return `<circle cx="${object.left + object.radius}" cy="${object.top + object.radius}" r="${object.radius}" fill="${escapeXml(object.fill)}"/>`;
    }
    if (object.type === "image") return "";
    if (object.type === "textbox") {
      const anchor = object.textAlign === "center" ? "middle" : object.textAlign === "right" ? "end" : "start";
      const x = object.textAlign === "center" ? object.left + object.width / 2 : object.textAlign === "right" ? object.left + object.width : object.left;
      const lines = String(object.text).split("\n");
      return `<text x="${x}" y="${object.top + object.fontSize}" fill="${escapeXml(object.fill)}" font-family="${escapeXml(object.fontFamily)}" font-size="${object.fontSize}" font-weight="${object.fontWeight}" text-anchor="${anchor}">${lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : object.fontSize * 1.08}">${escapeXml(line)}</tspan>`).join("")}</text>`;
    }
    return "";
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const makePreset = (
  id: string,
  name: string,
  width: number,
  height: number,
  background: string,
  objects: PresetObject[],
  category: DesignPreset["category"] = "social",
  keywords: string[] = [],
): DesignPreset => {
  const allObjects = [workspace(width, height, background), ...objects];
  const previewPhotoUrl = objects.find((object) => object.type === "image")?.src as string | undefined;
  return {
    id,
    name,
    width,
    height,
    json: JSON.stringify({ version: "5.3.0", objects: allObjects }),
    thumbnailUrl: previewDataUrl(width, height, allObjects, Boolean(previewPhotoUrl)),
    previewPhotoUrl,
    isPro: false,
    category,
    keywords,
  };
};

export const DESIGN_PRESETS: DesignPreset[] = [
  makePreset("preset-neon-sale", "Neon Flash Sale", 1080, 1080, "#111225", [
    circle("accent-orb", 690, -80, 270, "#c9ff5a"),
    rect("label-bg", 76, 78, 260, 64, "#7657ff", 32),
    text("eyebrow", "48 HOURS ONLY", 104, 92, 210, 28, "#ffffff", "Inter", 800),
    text("title", "FLASH\nSALE", 72, 220, 760, 176, "#ffffff", "Bebas Neue", 800),
    text("discount", "50%", 604, 580, 390, 190, "#111225", "Bebas Neue", 800, "center"),
    text("subtitle", "Selected products · Online only", 80, 700, 520, 42, "#c9ff5a", "Inter", 700),
    rect("cta-bg", 78, 870, 360, 92, "#ffffff", 46),
    text("cta", "SHOP NOW  →", 118, 892, 280, 38, "#111225", "Inter", 800, "center"),
  ]),
  makePreset("preset-editorial-quote", "Editorial Quote", 1080, 1350, "#f4efe6", [
    rect("side-block", 0, 0, 220, 1350, "#172e27"),
    text("issue", "ISSUE 08 · JOURNAL", 276, 94, 690, 28, "#8b5d42", "Inter", 700),
    text("quote", "Design is\nintelligence\nmade visible.", 274, 250, 690, 108, "#172e27", "Cormorant Garamond", 600),
    rect("divider", 276, 720, 160, 8, "#c56d46"),
    text("author", "— ALINA WHEELER", 276, 770, 650, 30, "#172e27", "Inter", 800),
    text("footer", "CREATIVE NOTES / 2026", 276, 1190, 650, 26, "#8b5d42", "Inter", 700),
  ]),
  makePreset("preset-coffee-promo", "Coffee Launch", 1080, 1350, "#efe3ce", [
    circle("coffee", 530, 330, 360, "#4a2e22"),
    circle("cream", 650, 450, 240, "#c99562"),
    rect("badge", 70, 80, 250, 70, "#d24c35", 35),
    text("badge-text", "NEW BLEND", 98, 98, 194, 30, "#ffffff", "Inter", 800, "center"),
    text("title", "Slow mornings.\nBold coffee.", 70, 190, 760, 88, "#30231d", "Playfair Display", 700),
    text("description", "Single-origin beans roasted weekly.", 72, 1080, 720, 34, "#5d4539", "Inter", 600),
    rect("cta-bg", 70, 1170, 330, 92, "#30231d", 46),
    text("cta", "ORDER ONLINE", 105, 1194, 260, 34, "#ffffff", "Inter", 800, "center"),
  ]),
  makePreset("preset-tech-thumbnail", "Tech Video Thumbnail", 1280, 720, "#09111f", [
    circle("glow", 860, 20, 290, "#2878ff"),
    rect("device", 875, 132, 300, 490, "#d9e6ff", 38),
    rect("device-screen", 900, 176, 250, 380, "#121d33", 22),
    text("tag", "NEW VIDEO", 72, 68, 270, 30, "#79ffa8", "Inter", 800),
    text("title", "BUILD\nFASTER", 68, 150, 700, 118, "#ffffff", "Bebas Neue", 800),
    text("subtitle", "7 tools every creator should know", 74, 454, 640, 38, "#b7c8e7", "Inter", 600),
    rect("episode-bg", 72, 570, 240, 62, "#79ffa8", 31),
    text("episode", "EPISODE 12", 98, 585, 190, 27, "#09111f", "Inter", 800, "center"),
  ]),
  makePreset("preset-real-estate", "Modern Property", 1080, 1350, "#f7f5f0", [
    rect("photo", 54, 54, 972, 690, "#b7c8bd", 28),
    rect("building-one", 540, 180, 270, 564, "#e8e0d5"),
    rect("building-two", 790, 280, 180, 464, "#304a43"),
    text("photo-label", "YOUR PROPERTY PHOTO", 90, 100, 500, 26, "#304a43", "Inter", 800),
    text("title", "A place to\ncall your own.", 64, 800, 680, 82, "#20332e", "Playfair Display", 700),
    text("price", "$485,000", 730, 820, 290, 48, "#ba684c", "Inter", 800, "right"),
    text("details", "3 BED  ·  2 BATH  ·  1,840 SQ FT", 66, 1050, 700, 30, "#536963", "Inter", 700),
    rect("cta-bg", 64, 1150, 420, 92, "#20332e", 46),
    text("cta", "BOOK A VIEWING", 105, 1174, 338, 34, "#ffffff", "Inter", 800, "center"),
  ]),
  makePreset("preset-podcast", "Podcast Episode", 1080, 1080, "#f3b4ca", [
    circle("vinyl", 610, 260, 300, "#151320"),
    circle("vinyl-label", 790, 440, 120, "#ff7448"),
    rect("series-bg", 68, 68, 300, 58, "#151320", 29),
    text("series", "THE CREATIVE HOUR", 91, 83, 254, 25, "#ffffff", "Inter", 800, "center"),
    text("title", "MAKE\nBETTER\nWORK", 68, 210, 610, 108, "#151320", "Bebas Neue", 800),
    text("episode", "EP. 024 · WITH MAYA RUIZ", 70, 890, 620, 32, "#151320", "Inter", 800),
    text("url", "YOURPODCAST.COM", 70, 972, 620, 25, "#7f3150", "Inter", 700),
  ]),
  makePreset("preset-webinar", "Webinar Announcement", 1200, 627, "#e9e5ff", [
    rect("panel", 744, 0, 456, 627, "#5b35d5"),
    circle("speaker", 835, 105, 136, "#c9ff5a"),
    text("speaker-label", "SPEAKER\nPHOTO", 835, 183, 272, 34, "#38218f", "Inter", 800, "center"),
    text("eyebrow", "FREE LIVE WEBINAR", 58, 58, 610, 25, "#5b35d5", "Inter", 800),
    text("title", "Turn ideas into\ncontent systems", 56, 130, 650, 62, "#101426", "DM Sans", 800),
    text("date", "AUG 28  ·  11:00 AM EST", 58, 365, 620, 28, "#5b35d5", "Inter", 800),
    rect("cta-bg", 56, 458, 310, 84, "#101426", 42),
    text("cta", "SAVE YOUR SEAT", 83, 480, 256, 30, "#ffffff", "Inter", 800, "center"),
  ]),
  makePreset("preset-wellness-story", "Wellness Story", 1080, 1920, "#dce9df", [
    circle("sun", 650, 180, 290, "#f5c16c"),
    rect("photo", 90, 560, 900, 720, "#7fa08a", 40),
    text("photo-label", "YOUR PHOTO", 90, 890, 900, 38, "#ffffff", "Inter", 800, "center"),
    text("eyebrow", "A 7-DAY RESET", 90, 92, 600, 30, "#365143", "Inter", 800),
    text("title", "Find your\nslow rhythm.", 86, 176, 820, 100, "#213a2d", "Cormorant Garamond", 600),
    text("description", "Small rituals for calmer mornings and clearer days.", 92, 1380, 840, 42, "#365143", "Inter", 600),
    rect("cta-bg", 90, 1580, 450, 104, "#213a2d", 52),
    text("cta", "START THE GUIDE", 132, 1608, 366, 38, "#ffffff", "Inter", 800, "center"),
    text("handle", "@YOURBRAND", 90, 1790, 500, 28, "#567263", "Inter", 800),
  ]),
  makePreset("preset-luxury-listing", "Luxury Home Listing", 1080, 1080, "#18202a", [
    photo("property-photo", DESIGN_IMAGES.interior, 1800, 1200, 0, 0, 1080, 720),
    rect("info-panel", 0, 720, 1080, 360, "#18202a"),
    text("brand", "NORTH & CO. REALTY", 58, 760, 500, 24, "#d9b77b", "Inter", 800),
    text("title", "Modern living,\nbeautifully framed.", 56, 818, 640, 54, "#ffffff", "Playfair Display", 700),
    text("price", "$550,000", 735, 810, 285, 48, "#d9b77b", "Inter", 800, "right"),
    text("details", "3 BED  ·  2.5 BATH  ·  2,120 SQ FT", 58, 1000, 720, 24, "#cbd3dc", "Inter", 700),
  ], "business", ["real estate", "property", "home", "listing"]),
  makePreset("preset-open-house-story", "Open House Story", 1080, 1920, "#f3eee7", [
    photo("property-photo", DESIGN_IMAGES.interior, 1800, 1200, 0, 380, 1080, 900),
    rect("top-panel", 0, 0, 1080, 430, "#f3eee7"),
    text("eyebrow", "OPEN HOUSE · SATURDAY", 78, 72, 920, 30, "#a26649", "Inter", 800, "center"),
    text("title", "Your next chapter\nstarts here.", 75, 150, 930, 78, "#26332e", "Cormorant Garamond", 700, "center"),
    rect("bottom-panel", 0, 1280, 1080, 640, "#26332e"),
    text("address", "1842 OAKVIEW AVENUE", 78, 1360, 924, 36, "#ffffff", "Inter", 800, "center"),
    text("details", "4 bedrooms  ·  Garden  ·  Natural light", 78, 1445, 924, 30, "#d5dfda", "Inter", 600, "center"),
    rect("cta-bg", 310, 1580, 460, 100, "#d9b77b", 50),
    text("cta", "BOOK A VISIT", 350, 1607, 380, 36, "#26332e", "Inter", 800, "center"),
    text("contact", "YOURAGENCY.COM  ·  +1 555 0184", 78, 1800, 924, 26, "#aebdb5", "Inter", 700, "center"),
  ], "business", ["real estate", "open house", "story", "property"]),
  makePreset("preset-fresh-menu", "Fresh Lunch Special", 1080, 1080, "#fff8ea", [
    photo("food-photo", DESIGN_IMAGES.food, 1800, 1200, 0, 0, 1080, 610),
    rect("content", 0, 610, 1080, 470, "#fff8ea"),
    circle("accent", 835, 545, 112, "#f2a93b"),
    text("price", "$18", 835, 605, 224, 66, "#173f32", "Bebas Neue", 800, "center"),
    text("eyebrow", "TODAY'S SPECIAL", 62, 668, 500, 26, "#e2673f", "Inter", 800),
    text("title", "Color on your plate.", 60, 730, 720, 62, "#173f32", "Playfair Display", 700),
    text("description", "Seasonal vegetables · house dressing · fresh bread", 62, 835, 880, 28, "#51695f", "Inter", 600),
    rect("cta-bg", 60, 940, 340, 82, "#173f32", 41),
    text("cta", "ORDER FOR PICKUP", 92, 962, 276, 29, "#ffffff", "Inter", 800, "center"),
  ], "social", ["restaurant", "food", "lunch", "menu"]),
  makePreset("preset-food-editorial", "Food Editorial Cover", 1200, 630, "#efe6d1", [
    photo("food-photo", DESIGN_IMAGES.food, 1800, 1200, 665, 0, 535, 630),
    rect("left-panel", 0, 0, 690, 630, "#efe6d1"),
    rect("label", 58, 50, 170, 42, "#3d7b5c", 21),
    text("label-text", "8 MIN READ", 72, 61, 142, 18, "#ffffff", "Inter", 800, "center"),
    text("title", "A brighter way\nto eat well", 55, 135, 570, 68, "#173f32", "Playfair Display", 700),
    text("subtitle", "Simple seasonal ideas for everyday cooking.", 58, 355, 520, 28, "#536c61", "Inter", 600),
    text("author", "THE GOOD TABLE · JOURNAL 05", 58, 530, 540, 23, "#c25d3d", "Inter", 800),
  ], "business", ["blog", "food", "open graph", "article"]),
  makePreset("preset-podcast-studio", "Podcast Studio Cover", 1080, 1080, "#0a1422", [
    photo("podcast-photo", DESIGN_IMAGES.podcast, 1200, 1800, 500, 0, 580, 1080),
    rect("shade", 0, 0, 650, 1080, "#0a1422"),
    rect("tag", 58, 62, 240, 54, "#ff6b35", 27),
    text("tag-text", "NEW EPISODE", 80, 76, 196, 23, "#ffffff", "Inter", 800, "center"),
    text("title", "THE\nSIGNAL", 54, 195, 560, 120, "#ffffff", "Bebas Neue", 800),
    text("subtitle", "Stories behind the people building what's next.", 62, 520, 480, 34, "#b9cce6", "Inter", 600),
    text("episode", "EPISODE 31  ·  LISTEN NOW", 62, 890, 520, 27, "#ff9a70", "Inter", 800),
  ], "video", ["podcast", "audio", "episode", "spotify"]),
  makePreset("preset-youtube-podcast", "Bold Podcast Thumbnail", 1280, 720, "#f6d928", [
    photo("host-photo", DESIGN_IMAGES.podcast, 1200, 1800, 820, 0, 460, 720),
    rect("accent", 0, 510, 860, 210, "#5b35d5"),
    text("series", "CREATOR PODCAST · #18", 58, 46, 650, 28, "#101426", "Inter", 800),
    text("title", "BUILD A\nGREAT SHOW", 52, 115, 760, 98, "#101426", "Bebas Neue", 800),
    text("subtitle", "The format that keeps listeners coming back", 60, 548, 720, 34, "#ffffff", "Inter", 700),
    rect("watch", 58, 625, 250, 54, "#101426", 27),
    text("watch-text", "WATCH NOW", 83, 638, 200, 24, "#f6d928", "Inter", 800, "center"),
  ], "video", ["youtube", "podcast", "thumbnail", "creator"]),
  makePreset("preset-football-show", "Game Day Podcast", 1080, 1080, "#111111", [
    photo("sports-photo", DESIGN_IMAGES.football, 1800, 1349, 0, 0, 1080, 690),
    rect("headline", 0, 650, 1080, 430, "#d62d20"),
    rect("tag", 56, 605, 300, 70, "#111111", 8),
    text("tag-text", "THE WEEKLY HUDDLE", 76, 623, 260, 29, "#ffffff", "Inter", 800, "center"),
    text("title", "GAME DAY\nBREAKDOWN", 52, 720, 790, 82, "#ffffff", "Bebas Neue", 800),
    text("subtitle", "Predictions · analysis · the stories behind the score", 58, 930, 870, 29, "#ffd9d5", "Inter", 700),
  ], "video", ["sports", "football", "podcast", "game"]),
  makePreset("preset-football-thumbnail", "Football Video Thumbnail", 1280, 720, "#101426", [
    photo("sports-photo", DESIGN_IMAGES.football, 1800, 1349, 690, 0, 590, 720),
    rect("left-panel", 0, 0, 750, 720, "#101426"),
    rect("number", 54, 54, 110, 88, "#c9ff5a", 12),
    text("number-text", "07", 54, 68, 110, 54, "#101426", "Bebas Neue", 800, "center"),
    text("title", "PLAYS THAT\nCHANGED\nTHE GAME", 52, 185, 640, 74, "#ffffff", "Bebas Neue", 800),
    text("footer", "TACTICS EXPLAINED  ·  NEW SERIES", 56, 630, 600, 25, "#c9ff5a", "Inter", 800),
  ], "video", ["youtube", "football", "sports", "thumbnail"]),
  makePreset("preset-skincare-review", "Skincare Product Review", 1080, 1080, "#e8e3dc", [
    photo("product-photo", DESIGN_IMAGES.skincare, 1800, 1800, 440, 0, 640, 1080),
    rect("review-card", 54, 210, 520, 680, "#fffdf9", 32),
    text("brand", "THE BEAUTY EDIT", 94, 260, 430, 24, "#86766b", "Inter", 800),
    text("title", "A serum worth\nthe ritual", 92, 330, 430, 54, "#342b27", "Playfair Display", 700),
    text("stars", "★★★★★", 94, 520, 430, 35, "#d28b53", "Inter", 800),
    text("review", "Lightweight, calming and made for a simple everyday routine.", 94, 600, 410, 28, "#685a52", "Inter", 600),
    text("author", "REVIEWED BY MAYA L.", 94, 810, 410, 21, "#9b877b", "Inter", 800),
  ], "social", ["beauty", "skincare", "review", "product"]),
  makePreset("preset-beauty-sale", "Beauty Flash Sale", 1080, 1350, "#efbad1", [
    photo("product-photo", DESIGN_IMAGES.skincare, 1800, 1800, 120, 470, 840, 760),
    circle("accent-one", -90, -80, 220, "#ffef74"),
    circle("accent-two", 860, 1140, 190, "#5b35d5"),
    text("brand", "YOUR BEAUTY STORE", 80, 70, 920, 27, "#632a4d", "Inter", 800, "center"),
    text("title", "GLOW\nWEEK", 78, 150, 924, 108, "#ffffff", "Bebas Neue", 800, "center"),
    rect("discount", 334, 390, 412, 74, "#5b35d5", 37),
    text("discount-text", "20% OFF EVERYTHING", 365, 409, 350, 30, "#ffffff", "Inter", 800, "center"),
    rect("cta-bg", 340, 1230, 400, 86, "#ffffff", 43),
    text("cta", "SHOP THE EDIT", 380, 1253, 320, 31, "#632a4d", "Inter", 800, "center"),
  ], "social", ["beauty", "sale", "ecommerce", "skincare"]),
  makePreset("preset-travel-story", "Tropical Escape Story", 1080, 1920, "#0b4f62", [
    photo("beach-photo", DESIGN_IMAGES.beach, 1800, 1128, 0, 0, 1080, 1920),
    rect("top-shade", 0, 0, 1080, 520, "rgba(4,35,48,0.70)"),
    rect("bottom-shade", 0, 1390, 1080, 530, "rgba(4,35,48,0.78)"),
    text("eyebrow", "THE WEEKEND GUIDE", 76, 80, 928, 30, "#a9f0df", "Inter", 800, "center"),
    text("title", "Go where the\nwater is clearer.", 74, 170, 930, 88, "#ffffff", "Playfair Display", 700, "center"),
    text("place", "PALM COAST · 3 DAYS", 80, 1480, 920, 34, "#ffffff", "Inter", 800, "center"),
    text("description", "Swim, slow down and leave room for wonder.", 100, 1570, 880, 34, "#d5f7ef", "Inter", 600, "center"),
    rect("cta-bg", 330, 1735, 420, 96, "#ffcf70", 48),
    text("cta", "EXPLORE THE TRIP", 370, 1761, 340, 34, "#063b49", "Inter", 800, "center"),
  ], "social", ["travel", "beach", "story", "vacation"]),
  makePreset("preset-travel-quote", "Travel Quote Post", 1080, 1080, "#123846", [
    photo("beach-photo", DESIGN_IMAGES.beach, 1800, 1128, 0, 0, 1080, 1080),
    rect("overlay", 0, 0, 1080, 1080, "rgba(8,34,43,0.48)"),
    text("quote", "Collect moments,\nnot itineraries.", 90, 300, 900, 84, "#ffffff", "Cormorant Garamond", 700, "center"),
    rect("divider", 430, 600, 220, 7, "#ffcf70"),
    text("author", "THE SLOW TRAVEL CLUB", 90, 660, 900, 26, "#ffffff", "Inter", 800, "center"),
  ], "social", ["travel", "quote", "beach", "instagram"]),
  makePreset("preset-cafe-event", "Cafe Community Night", 1080, 1350, "#2b211c", [
    photo("cafe-photo", DESIGN_IMAGES.cafe, 1350, 1800, 440, 0, 640, 1350),
    rect("panel", 0, 0, 560, 1350, "#2b211c"),
    text("brand", "AROMA SOCIAL CLUB", 56, 70, 450, 24, "#e9bd78", "Inter", 800),
    text("title", "Coffee, ideas\n& good company.", 52, 210, 455, 68, "#ffffff", "Playfair Display", 700),
    text("date", "THURSDAY · 7 PM", 56, 600, 440, 30, "#e9bd78", "Inter", 800),
    text("details", "An evening for local makers, founders and curious minds.", 56, 680, 420, 29, "#d7cbc4", "Inter", 600),
    rect("cta-bg", 54, 1040, 370, 88, "#e9bd78", 44),
    text("cta", "RESERVE A SEAT", 90, 1063, 298, 31, "#2b211c", "Inter", 800, "center"),
  ], "business", ["cafe", "event", "community", "coffee"]),
  makePreset("preset-certificate", "Modern Achievement Certificate", 1451, 1012, "#faf8f3", [
    rect("border", 38, 38, 1375, 936, "#173f32", 4),
    rect("inner", 52, 52, 1347, 908, "#faf8f3", 2),
    circle("seal", 1110, 110, 92, "#d6aa52"),
    circle("seal-inner", 1135, 135, 67, "#f8dd8b"),
    text("eyebrow", "CERTIFICATE", 155, 120, 980, 74, "#173f32", "Cormorant Garamond", 700, "center"),
    text("subtitle", "OF ACHIEVEMENT", 155, 220, 980, 27, "#b07a32", "Inter", 800, "center"),
    text("presented", "THIS CERTIFICATE IS PROUDLY PRESENTED TO", 190, 345, 1070, 21, "#69746f", "Inter", 700, "center"),
    text("recipient", "Alex Morgan", 190, 405, 1070, 64, "#173f32", "Pacifico", 400, "center"),
    text("description", "For outstanding dedication, thoughtful leadership and meaningful contribution.", 260, 535, 930, 25, "#4f5d57", "Inter", 500, "center"),
    rect("signature-line", 245, 765, 310, 3, "#173f32"),
    rect("date-line", 895, 765, 310, 3, "#173f32"),
    text("signature", "SIGNATURE", 245, 790, 310, 18, "#69746f", "Inter", 700, "center"),
    text("date", "DATE", 895, 790, 310, 18, "#69746f", "Inter", 700, "center"),
  ], "documents", ["certificate", "award", "achievement", "diploma"]),
  makePreset("preset-invoice", "Clean Service Invoice", 1020, 1320, "#ffffff", [
    rect("header", 0, 0, 1020, 250, "#132f4c"),
    text("logo", "NORTHLINE", 62, 62, 480, 44, "#ffffff", "Inter", 800),
    text("invoice", "INVOICE", 680, 62, 280, 48, "#8ed4ff", "Inter", 800, "right"),
    text("number", "NO. 001284", 680, 130, 280, 22, "#c9dbea", "Inter", 700, "right"),
    text("bill-title", "BILL TO", 62, 320, 260, 20, "#6c7b87", "Inter", 800),
    text("client", "Jordan Lee\n123 Market Street\nhello@client.com", 62, 365, 400, 28, "#1c2c39", "Inter", 600),
    text("date", "ISSUED  12 JUL 2026\nDUE  26 JUL 2026", 625, 365, 335, 24, "#1c2c39", "Inter", 700, "right"),
    rect("table-head", 62, 565, 896, 58, "#eaf4fa", 8),
    text("head", "DESCRIPTION                         QTY             AMOUNT", 82, 581, 856, 20, "#31546d", "Inter", 800),
    text("items", "Brand strategy workshop                  1              $1,200\nDesign system setup                         1              $2,400\nTemplate library                              12             $1,080", 82, 670, 856, 25, "#263845", "Inter", 600),
    rect("total-line", 610, 1010, 348, 3, "#132f4c"),
    text("total", "TOTAL     $4,680", 610, 1050, 348, 32, "#132f4c", "Inter", 800, "right"),
    text("footer", "Thank you for your business · northline.co", 62, 1215, 896, 21, "#7a8790", "Inter", 600, "center"),
  ], "documents", ["invoice", "billing", "receipt", "business"]),
  makePreset("preset-resume", "Minimal Creative Resume", 1020, 1320, "#f8f8f6", [
    rect("sidebar", 0, 0, 300, 1320, "#1e2a27"),
    circle("avatar", 70, 85, 80, "#d9b77b"),
    text("name", "MIA\nSANTOS", 46, 290, 210, 52, "#ffffff", "Bebas Neue", 800),
    text("role", "PRODUCT DESIGNER", 46, 430, 210, 21, "#d9b77b", "Inter", 800),
    text("contact-title", "CONTACT", 46, 560, 210, 20, "#d9b77b", "Inter", 800),
    text("contact", "+1 555 0188\nmia@email.com\nmiaportfolio.com", 46, 605, 210, 22, "#d5dfdb", "Inter", 600),
    text("headline", "Designing clear products\nfor complex problems.", 365, 90, 590, 48, "#1e2a27", "DM Sans", 800),
    text("about-title", "PROFILE", 365, 280, 590, 20, "#a27049", "Inter", 800),
    text("about", "Multidisciplinary designer focused on thoughtful systems, accessible experiences and measurable outcomes.", 365, 325, 565, 23, "#52615c", "Inter", 500),
    text("experience-title", "EXPERIENCE", 365, 485, 590, 20, "#a27049", "Inter", 800),
    text("experience", "SENIOR PRODUCT DESIGNER  ·  2023—NOW\nStudio North\n\nPRODUCT DESIGNER  ·  2020—2023\nCommon Ground", 365, 535, 565, 24, "#26342f", "Inter", 700),
    text("skills-title", "SELECTED SKILLS", 365, 940, 590, 20, "#a27049", "Inter", 800),
    text("skills", "Product strategy  ·  Design systems\nResearch  ·  Prototyping  ·  Facilitation", 365, 985, 565, 23, "#52615c", "Inter", 600),
  ], "documents", ["resume", "cv", "portfolio", "career"]),
  makePreset("preset-shipping-label", "Modern Shipping Label", 1200, 1200, "#ffffff", [
    rect("outer-border", 35, 35, 1130, 1130, "#111111", 8),
    rect("brand-box", 35, 35, 320, 250, "#111111"),
    text("brand", "LO\nGO", 105, 74, 180, 68, "#ffffff", "Bebas Neue", 800, "center"),
    text("ship-title", "SHIP TO", 395, 70, 330, 28, "#111111", "Inter", 800),
    text("ship", "ETHAN STUART\n123 PRINCIPAL STREET APT 45A\nNEW YORK, NY 10001", 395, 120, 700, 25, "#111111", "Inter", 600),
    rect("divider-one", 35, 285, 1130, 4, "#111111"),
    text("order", "ORDER ID\n#1020304050", 70, 340, 280, 24, "#111111", "Inter", 800),
    text("dimensions", "DIMENSIONS\n10 × 10 × 10 CM", 395, 340, 280, 24, "#111111", "Inter", 800),
    text("weight", "WEIGHT\n4.5 KG", 720, 340, 180, 24, "#111111", "Inter", 800),
    text("date", "SHIP DATE\n2026-07-20", 920, 340, 200, 24, "#111111", "Inter", 800),
    rect("divider-two", 35, 535, 1130, 4, "#111111"),
    text("barcode", "|||| ||| |||| | ||||| || |||| ||| | |||||", 115, 650, 970, 58, "#111111", "Courier New", 800, "center"),
    text("tracking", "1Z 223 344 556 677 889 9", 115, 755, 970, 28, "#111111", "Inter", 700, "center"),
    text("note", "HANDLE WITH CARE  ·  THANK YOU", 115, 1040, 970, 24, "#111111", "Inter", 800, "center"),
  ], "documents", ["shipping", "label", "logistics", "order"]),
  makePreset("preset-holiday-card", "Midnight Holiday Card", 1050, 600, "#15294b", [
    circle("moon", 790, -60, 180, "#d9ecff"),
    circle("ornament-one", 75, 70, 52, "#d9b75f"),
    circle("ornament-two", 188, 30, 34, "#d45b55"),
    circle("ornament-three", 895, 395, 58, "#d9b75f"),
    text("eyebrow", "WITH WARM WISHES", 105, 120, 840, 23, "#bcd3ee", "Inter", 800, "center"),
    text("title", "A season full of\nlight and wonder", 105, 180, 840, 60, "#ffffff", "Cormorant Garamond", 700, "center"),
    rect("divider", 405, 375, 240, 4, "#d9b75f"),
    text("from", "FROM THE MARTÍNEZ FAMILY", 105, 420, 840, 22, "#bcd3ee", "Inter", 700, "center"),
  ], "seasonal", ["holiday", "christmas", "card", "greeting"]),
  makePreset("preset-new-year", "New Year Celebration", 1080, 1080, "#3d1f5f", [
    circle("spark-one", 70, 80, 42, "#ffcf70"),
    circle("spark-two", 900, 155, 70, "#ff8ab3"),
    circle("spark-three", 120, 820, 85, "#8ed4ff"),
    circle("spark-four", 865, 820, 42, "#ffcf70"),
    text("eyebrow", "HERE'S TO WHAT'S NEXT", 90, 120, 900, 27, "#e8dafa", "Inter", 800, "center"),
    text("year", "2027", 90, 250, 900, 190, "#ffffff", "Bebas Neue", 800, "center"),
    text("message", "New ideas. Bold moves.\nBeautiful beginnings.", 150, 610, 780, 48, "#ffcf70", "DM Sans", 700, "center"),
    rect("cta-bg", 355, 855, 370, 82, "#ffffff", 41),
    text("cta", "CELEBRATE WITH US", 390, 877, 300, 29, "#3d1f5f", "Inter", 800, "center"),
  ], "seasonal", ["new year", "celebration", "party", "event"]),
  makePreset("preset-halloween-night", "Halloween After Dark", 1080, 1350, "#13091b", [
    photo("pumpkin-photo", DESIGN_IMAGES.halloween, 1800, 1200, 0, 0, 1080, 1350),
    rect("top-shade", 0, 0, 1080, 680, "rgba(20,7,27,0.58)"),
    rect("bottom-shade", 0, 990, 1080, 360, "rgba(20,7,27,0.82)"),
    rect("date-chip", 70, 72, 320, 64, "#ff7a1a", 32),
    text("date", "OCTOBER 31 · 9 PM", 98, 89, 264, 27, "#18091f", "Inter", 800, "center"),
    text("title", "NIGHT OF\nSHADOWS", 64, 200, 850, 118, "#ffffff", "Bebas Neue", 800),
    text("subtitle", "Costumes · cocktails · wicked good music", 72, 1060, 900, 32, "#eadff0", "Inter", 700),
    text("location", "THE UNDERGROUND · 184 MIDNIGHT ST.", 72, 1190, 900, 25, "#ff9b48", "Inter", 800),
  ], "seasonal", ["halloween", "october", "party", "instagram", "pumpkin"]),
  makePreset("preset-halloween-story", "Spooky Season Story", 1080, 1920, "#180b20", [
    photo("pumpkin-photo", DESIGN_IMAGES.halloween, 1800, 1200, 0, 0, 1080, 1920),
    rect("overlay", 0, 0, 1080, 1920, "rgba(19,7,26,0.46)"),
    text("eyebrow", "SPOOKY SEASON IS HERE", 90, 95, 900, 30, "#ff9b48", "Inter", 800, "center"),
    text("title", "TRICK\nOR\nTREAT?", 80, 310, 920, 150, "#ffffff", "Bebas Neue", 800, "center"),
    rect("poll-one", 180, 1300, 720, 100, "#ff7a1a", 50),
    text("poll-one-text", "TRICK", 220, 1328, 640, 37, "#180b20", "Inter", 800, "center"),
    rect("poll-two", 180, 1435, 720, 100, "#ffffff", 50),
    text("poll-two-text", "TREAT", 220, 1463, 640, 37, "#180b20", "Inter", 800, "center"),
    text("handle", "@YOURBRAND", 90, 1780, 900, 27, "#ffffff", "Inter", 800, "center"),
  ], "seasonal", ["halloween", "story", "poll", "spooky", "instagram"]),
  makePreset("preset-christmas-editorial", "Christmas Gift Edit", 1080, 1350, "#163d33", [
    photo("christmas-photo", DESIGN_IMAGES.christmas, 1800, 1202, 0, 0, 1080, 1350),
    rect("shade", 0, 0, 1080, 1350, "rgba(12,50,41,0.36)"),
    rect("editorial-card", 70, 100, 600, 610, "rgba(250,245,234,0.94)", 28),
    text("edition", "THE HOLIDAY EDIT · 2026", 112, 148, 516, 24, "#ad382f", "Inter", 800),
    text("title", "Gifts with\na little more\nmagic.", 106, 220, 520, 76, "#173b32", "Playfair Display", 700),
    rect("divider", 110, 535, 150, 7, "#c99a4b"),
    text("description", "Thoughtful finds for everyone on your list.", 110, 580, 500, 29, "#526b63", "Inter", 600),
    rect("cta-bg", 70, 1120, 400, 94, "#ad382f", 47),
    text("cta", "SHOP THE GUIDE", 108, 1145, 324, 34, "#ffffff", "Inter", 800, "center"),
  ], "seasonal", ["christmas", "december", "gift guide", "holiday", "instagram"]),
  makePreset("preset-christmas-story", "Christmas Countdown", 1080, 1920, "#173b32", [
    photo("christmas-photo", DESIGN_IMAGES.christmas, 1800, 1202, 0, 0, 1080, 1920),
    rect("overlay", 0, 0, 1080, 1920, "rgba(10,48,39,0.52)"),
    text("eyebrow", "THE COUNTDOWN BEGINS", 90, 110, 900, 30, "#f5d38d", "Inter", 800, "center"),
    text("number", "12", 90, 340, 900, 280, "#ffffff", "Bebas Neue", 800, "center"),
    text("days", "DAYS UNTIL CHRISTMAS", 90, 650, 900, 42, "#ffffff", "Inter", 800, "center"),
    rect("divider", 390, 770, 300, 7, "#d84a3e"),
    text("message", "Cozy nights, warm lights\nand something special coming.", 120, 850, 840, 48, "#f8eee0", "Playfair Display", 700, "center"),
    rect("cta-bg", 290, 1540, 500, 105, "#d84a3e", 53),
    text("cta", "SET A REMINDER", 335, 1569, 410, 36, "#ffffff", "Inter", 800, "center"),
  ], "seasonal", ["christmas", "december", "story", "countdown", "holiday"]),
  makePreset("preset-fireworks-party", "New Year Midnight Party", 1080, 1350, "#080f2b", [
    photo("fireworks-photo", DESIGN_IMAGES.fireworks, 1800, 1202, 0, 0, 1080, 1350),
    rect("overlay", 0, 0, 1080, 1350, "rgba(5,10,34,0.42)"),
    text("eyebrow", "MIDNIGHT SOCIETY PRESENTS", 80, 80, 920, 26, "#ffd675", "Inter", 800, "center"),
    text("year", "2027", 70, 260, 940, 210, "#ffffff", "Bebas Neue", 800, "center"),
    text("title", "NEW YEAR'S EVE", 90, 520, 900, 54, "#ffd675", "DM Sans", 800, "center"),
    text("details", "DEC 31 · DOORS 9 PM · ROOFTOP HALL", 90, 680, 900, 29, "#ffffff", "Inter", 800, "center"),
    rect("cta-bg", 315, 1080, 450, 96, "#ffd675", 48),
    text("cta", "GET TICKETS", 355, 1107, 370, 34, "#080f2b", "Inter", 800, "center"),
  ], "seasonal", ["new year", "fireworks", "party", "event", "instagram"]),
  makePreset("preset-fireworks-story", "Hello New Year Story", 1080, 1920, "#080f2b", [
    photo("fireworks-photo", DESIGN_IMAGES.fireworks, 1800, 1202, 0, 0, 1080, 1920),
    rect("top-shade", 0, 0, 1080, 760, "rgba(4,8,30,0.52)"),
    rect("bottom-shade", 0, 1370, 1080, 550, "rgba(4,8,30,0.64)"),
    text("hello", "HELLO", 80, 160, 920, 52, "#ffd675", "Inter", 800, "center"),
    text("year", "2027", 70, 270, 940, 250, "#ffffff", "Bebas Neue", 800, "center"),
    text("message", "A fresh chapter.\nMake it unforgettable.", 110, 1460, 860, 58, "#ffffff", "Playfair Display", 700, "center"),
    text("handle", "@YOURBRAND", 90, 1800, 900, 27, "#ffd675", "Inter", 800, "center"),
  ], "seasonal", ["new year", "fireworks", "story", "celebration", "instagram"]),
  makePreset("preset-valentine", "Valentine Love Note", 1080, 1350, "#7d1632", [
    photo("flower-photo", DESIGN_IMAGES.valentine, 1800, 1200, 0, 0, 1080, 1350),
    rect("overlay", 0, 0, 1080, 1350, "rgba(86,9,34,0.30)"),
    rect("note", 86, 116, 710, 760, "rgba(255,247,242,0.93)", 36),
    text("eyebrow", "A LITTLE LOVE NOTE", 136, 170, 610, 25, "#b83c59", "Inter", 800),
    text("title", "You make\nevery day\nfeel special.", 130, 270, 620, 78, "#70152f", "Cormorant Garamond", 700),
    text("signature", "With love, always", 132, 700, 600, 46, "#b83c59", "Pacifico", 400),
    rect("cta-bg", 86, 1120, 390, 94, "#70152f", 47),
    text("cta", "SEND SOME LOVE", 122, 1145, 318, 33, "#ffffff", "Inter", 800, "center"),
  ], "seasonal", ["valentine", "love", "february", "flowers", "instagram"]),
  makePreset("preset-birthday-cake", "Birthday Celebration", 1080, 1080, "#f2b8cd", [
    photo("cake-photo", DESIGN_IMAGES.cake, 1800, 1324, 0, 0, 1080, 1080),
    rect("overlay", 0, 0, 1080, 1080, "rgba(44,18,54,0.28)"),
    rect("label", 70, 62, 330, 62, "#c9ff5a", 31),
    text("label-text", "YOU'RE INVITED", 96, 78, 278, 27, "#25142f", "Inter", 800, "center"),
    text("title", "BIRTHDAY\nBRUNCH", 62, 205, 800, 112, "#ffffff", "Bebas Neue", 800),
    text("details", "SUNDAY · 11 AM · THE GARDEN ROOM", 72, 775, 900, 29, "#ffffff", "Inter", 800),
    rect("cta-bg", 70, 875, 380, 88, "#6c2d80", 44),
    text("cta", "RSVP BY FRIDAY", 106, 898, 308, 31, "#ffffff", "Inter", 800, "center"),
  ], "seasonal", ["birthday", "cake", "party", "invitation", "instagram"]),
  makePreset("preset-fashion-drop", "New Collection Drop", 1080, 1350, "#191614", [
    photo("fashion-photo", DESIGN_IMAGES.fashion, 1200, 1800, 0, 0, 1080, 1350),
    rect("shade", 0, 0, 1080, 1350, "rgba(20,15,13,0.24)"),
    text("brand", "STUDIO / NINE", 72, 64, 500, 27, "#ffffff", "Inter", 800),
    text("season", "FALL · WINTER 2026", 600, 70, 408, 24, "#ffffff", "Inter", 800, "right"),
    text("title", "NEW\nENERGY", 60, 270, 740, 130, "#ffffff", "Bebas Neue", 800),
    rect("drop", 66, 655, 300, 68, "#c9ff5a", 34),
    text("drop-text", "THE DROP IS LIVE", 91, 673, 250, 28, "#161414", "Inter", 800, "center"),
    text("footer", "SHOP THE COLLECTION  →", 70, 1220, 600, 31, "#ffffff", "Inter", 800),
  ], "social", ["fashion", "street style", "clothing", "instagram", "sale"]),
  makePreset("preset-fashion-quote", "Street Style Quote", 1080, 1080, "#241c19", [
    photo("fashion-photo", DESIGN_IMAGES.fashion, 1200, 1800, 0, 0, 1080, 1080),
    rect("overlay", 0, 0, 1080, 1080, "rgba(26,16,13,0.38)"),
    rect("quote-card", 72, 570, 936, 380, "rgba(255,251,245,0.92)", 28),
    text("quote", "Style is how you\nintroduce yourself\nwithout speaking.", 118, 622, 844, 58, "#241c19", "Playfair Display", 700),
    text("handle", "@STUDIONINE", 120, 875, 840, 24, "#8b5d42", "Inter", 800),
  ], "social", ["fashion", "quote", "street style", "instagram"]),
  makePreset("preset-fitness-challenge", "30 Day Fitness Challenge", 1080, 1920, "#111922", [
    photo("fitness-photo", DESIGN_IMAGES.fitness, 1200, 1800, 0, 0, 1080, 1920),
    rect("top-shade", 0, 0, 1080, 850, "rgba(10,17,24,0.58)"),
    rect("bottom-shade", 0, 1320, 1080, 600, "rgba(10,17,24,0.74)"),
    rect("tag", 80, 90, 330, 70, "#b8ff4d", 35),
    text("tag-text", "STARTS MONDAY", 108, 109, 274, 29, "#111922", "Inter", 800, "center"),
    text("title", "30 DAY\nSTRONGER\nCHALLENGE", 70, 260, 900, 118, "#ffffff", "Bebas Neue", 800),
    text("description", "Daily workouts · Simple habits · Real momentum", 80, 1430, 920, 34, "#ffffff", "Inter", 700),
    rect("cta-bg", 80, 1580, 500, 104, "#b8ff4d", 52),
    text("cta", "JOIN THE CHALLENGE", 124, 1609, 412, 36, "#111922", "Inter", 800, "center"),
    text("handle", "@YOURFITNESSCLUB", 80, 1795, 920, 27, "#dce7ef", "Inter", 800),
  ], "social", ["fitness", "gym", "challenge", "story", "instagram"]),
  makePreset("preset-fitness-motivation", "Workout Motivation", 1080, 1080, "#101820", [
    photo("fitness-photo", DESIGN_IMAGES.fitness, 1200, 1800, 0, 0, 1080, 1080),
    rect("overlay", 0, 0, 1080, 1080, "rgba(8,15,22,0.46)"),
    text("eyebrow", "TODAY'S REMINDER", 70, 70, 940, 28, "#b8ff4d", "Inter", 800),
    text("title", "SHOW UP\nFOR\nYOURSELF.", 62, 180, 850, 115, "#ffffff", "Bebas Neue", 800),
    rect("divider", 66, 685, 220, 8, "#b8ff4d"),
    text("caption", "Progress is built one session at a time.", 70, 745, 820, 34, "#e5edf2", "Inter", 700),
    text("handle", "@YOURFITNESSCLUB", 70, 970, 820, 25, "#b8ff4d", "Inter", 800),
  ], "social", ["fitness", "motivation", "gym", "quote", "instagram"]),
];
