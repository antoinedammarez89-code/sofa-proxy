const express = require("express");
const fetch = require("node-fetch");

const app = express();

const headers = {
  "User-Agent": "Mozilla/5.0",
  "Accept": "application/json",
  "Referer": "https://www.sofascore.com/"
};

// LIVE
app.get("/live", async (req, res) => {
  try {
    const r = await fetch("https://www.sofascore.com/api/v1/sport/football/events/live", { headers });
    const data = await r.text();
    res.send(data);
  } catch (e) {
    res.status(500).send("error live");
  }
});

// STATS
app.get("/stats/:id", async (req, res) => {
  try {
    const r = await fetch(`https://www.sofascore.com/api/v1/event/${req.params.id}/statistics`, { headers });
    const data = await r.text();
    res.send(data);
  } catch (e) {
    res.status(500).send("error stats");
  }
});

app.listen(3000, () => console.log("running on 3000"));