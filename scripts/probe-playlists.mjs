const urls = [
  "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
  "https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d",
  "https://www.youtube.com/playlist?list=PLillGF-RfqbbnEGm5Mmz9S2Mvwb1JZIC",
];

async function load(url) {
  const html = await (
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })
  ).text();

  const i = html.indexOf("ytInitialData");
  const start = html.indexOf("{", i);
  let depth = 0;
  let end = -1;
  for (let k = start; k < html.length; k++) {
    const c = html[k];
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) {
        end = k + 1;
        break;
      }
    }
  }

  const data = JSON.parse(html.slice(start, end));
  const s = JSON.stringify(data);
  const ids = [...s.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
  const uniq = [...new Set(ids)];
  const alert = data?.alerts?.[0]?.alertRenderer?.text?.runs?.[0]?.text;
  const title = data?.metadata?.playlistMetadataRenderer?.title;
  return { url, title, alert, videoCount: uniq.length, sample: uniq.slice(0, 3) };
}

for (const url of urls) {
  try {
    console.log(JSON.stringify(await load(url), null, 2));
  } catch (error) {
    console.log(url, String(error));
  }
}
