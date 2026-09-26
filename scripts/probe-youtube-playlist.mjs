const id = "PLdO5xp5occOw1XQC6Tv6mVQ8NuYyE3XMm";

async function main() {
  const body = {
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20240401.00.00",
        hl: "en",
        gl: "US",
      },
    },
    browseId: `VL${id}`,
  };

  const res = await fetch(
    "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(body),
    },
  );

  console.log("status", res.status);
  const text = await res.text();
  console.log("body head", text.slice(0, 300));

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.log("not json");
    return;
  }

  const s = JSON.stringify(data);
  const matches = [...s.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]);
  const unique = [...new Set(matches)];
  console.log("video count", unique.length);
  console.log("sample", unique.slice(0, 5));

  // Also try HTML
  const htmlRes = await fetch(
    `https://www.youtube.com/playlist?list=${id}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    },
  );
  const html = await htmlRes.text();
  console.log("html status", htmlRes.status, "len", html.length);
  console.log("has ytInitialData", html.includes("ytInitialData"));
  const htmlIds = [
    ...html.matchAll(/"videoId":"([\w-]{11})"/g),
  ].map((m) => m[1]);
  console.log("html video ids", new Set(htmlIds).size, [...new Set(htmlIds)].slice(0, 5));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
