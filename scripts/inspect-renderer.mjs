const url =
  "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr";

const html = await (
  await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
    },
  })
).text();

const markerIndex = html.indexOf("ytInitialData");
const jsonStart = html.indexOf("{", markerIndex);
let depth = 0;
let end = -1;
for (let i = jsonStart; i < html.length; i++) {
  if (html[i] === "{") depth++;
  if (html[i] === "}") {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}
const data = JSON.parse(html.slice(jsonStart, end));
const s = JSON.stringify(data);
const id = "WUvTyaaNkzM";
const pos = s.indexOf(`"videoId":"${id}"`);
console.log("pos", pos);
console.log(s.slice(Math.max(0, pos - 200), pos + 500));

// find renderer-like keys near video ids
const keys = new Set();
const visit = (node, path = "") => {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item, i) => visit(item, `${path}[${i}]`));
    return;
  }
  const rec = node;
  if (typeof rec.videoId === "string" && rec.videoId === id) {
    console.log("found object keys", Object.keys(rec));
    console.log(JSON.stringify(rec, null, 2).slice(0, 1000));
  }
  for (const [k, v] of Object.entries(rec)) {
    if (k.toLowerCase().includes("video") || k.toLowerCase().includes("playlist")) {
      keys.add(k);
    }
    visit(v, `${path}.${k}`);
  }
};
visit(data);
console.log("video-ish keys", [...keys].slice(0, 40));
