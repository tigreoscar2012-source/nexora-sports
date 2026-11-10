
const http = require("node:http");

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
      res.writeHead(400);
      return res.end("Invalid parameters");
    }

    try {
      const today = new Date();
      const end = new Date(today);
      end.setUTCDate(end.getUTCDate() + days);

      const format = d => d.toISOString().slice(0, 10).replace(/-/g, "");

      const api = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagues[league]}/scoreboard?dates=${format(today)}-${format(end)}&limit=200`;

      const response = await fetch(api);

      if (!response.ok) throw new Error("ESPN unavailable");

      const data = await response.json();

      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
      });

      return res.end(JSON.stringify({
        events: data.events || []
      }));
    } catch (error) {
      res.writeHead(502, {
        "Content-Type": "application/json"
      });
      return res.end(JSON.stringify({
        error: "No se pudo consultar ESPN"
      }));
    }
  }

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  res.end("NEXORA SPORTS - servidor activo");
});

server.listen(PORT, "0.0.0.0");
