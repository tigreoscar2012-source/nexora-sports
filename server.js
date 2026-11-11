
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;

const leagues = {
  premier: "eng.1",
  seriea: "ita.1",
  laliga: "esp.1",
  bundesliga: "ger.1",
  eredivisie: "ned.1"
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/matches") {
    const league = url.searchParams.get("league") || "premier";
    const days = Number(url.searchParams.get("days") || 7);

    if (!leagues[league] || ![7, 14].includes(days)) {
      res.writeHead(400, {
        "Content-Type": "application/json"
      });
      return res.end(JSON.stringify({
        error: "Parámetros inválidos"
      }));
    }

    try {
      const now = new Date();
      const end = new Date(now.getTime() + days * 86400000);

      const format = d =>
        d.toISOString().slice(0, 10).replace(/-/g, "");

      const first = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      ));

      const dates = [];

      for (let i = 0; i <= days; i++) {
        const date = new Date(first);
        date.setUTCDate(date.getUTCDate() + i);

        if (date > end) break;
        dates.push(format(date));
      }

      const results = await Promise.allSettled(
        dates.map(async date => {
          const api =
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagues[league]}/scoreboard?dates=${date}`;

          const response = await fetch(api, {
            signal: AbortSignal.timeout(12000)
          });

          if (!response.ok) {
            throw new Error(`ESPN HTTP ${response.status}`);
          }

          return response.json();
        })
      );

      const eventsMap = new Map();
      let successfulDays = 0;

      for (const result of results) {
        if (result.status === "fulfilled") {
          successfulDays++;

          for (const event of result.value.events || []) {
            if (event.id) eventsMap.set(event.id, event);
          }
        } else {
          console.error("ERROR ESPN:", result.reason);
        }
      }

      if (
