import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// Cache simple en mémoire
const cache = {};
const TTL = {
  live: 15,        // secondes
  stats: 60,
  incidents: 90,
  event: 60
};

const now = () => Math.floor(Date.now() / 1000);

async function sofaFetch(url) {
  return axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8",
      "Referer": "https://www.sofascore.com/",
      "Accept-Encoding": "gzip, deflate, br"
    },
    timeout: 10000,
    validateStatus: () => true // 🔥 IMPORTANT
  });
}


// ✅ Live matches
app.get("/api/live", async (req, res) => {
  if (cache.live && now() - cache.live.time < TTL.live) {
    return res.json(cache.live.data);
  }

  try {
    const r = await sofaFetch(
      "https://www.sofascore.com/api/v1/sport/football/events/live"
    );
    cache.live = { time: now(), data: r.data };
    res.json(r.data);
  } catch {
    res.status(502).json({ error: "live failed" });
  }
});

// ✅ Stats
app.get("/api/stats/:id", async (req, res) => {
  const key = `stats_${req.params.id}`;

  if (cache[key] && now() - cache[key].time < TTL.stats) {
    return res.json(cache[key].data);
  }

  try {
    const r = await sofaFetch(
      `https://www.sofascore.com/api/v1/event/${req.params.id}/statistics`
    );
    cache[key] = { time: now(), data: r.data };
    res.json(r.data);
  } catch {
    res.status(502).json({ error: "stats failed" });
  }
});

// ✅ Incidents
app.get("/api/incidents/:id", async (req, res) => {
  const key = `inc_${req.params.id}`;

  if (cache[key] && now() - cache[key].time < TTL.incidents) {
    return res.json(cache[key].data);
  }

  try {
    const r = await sofaFetch(
      `https://www.sofascore.com/api/v1/event/${req.params.id}/incidents`
    );
    cache[key] = { time: now(), data: r.data };
    res.json(r.data);
  } catch {
    res.status(502).json({ error: "incidents failed" });
  }
});
// ✅ Proxy générique SofaScore (tous les endpoints API)
app.get("/api/v1/*", async (req, res) => {
  const targetPath = req.originalUrl.replace("/api", "");

  const r = await sofaFetch(
    "https://www.sofascore.com" + targetPath
  );

  console.log("STATUS", r.status);
  console.log("DATA", typeof r.data === "string"
    ? r.data.substring(0, 300)
    : r.data
  );

  res.status(r.status).json(r.data);
});


app.listen(PORT, () =>
  console.log("✅ SofaScore proxy running on port", PORT)
);
``
