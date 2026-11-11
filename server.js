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
      
      })
const today = new Date();
const format = d =>
  d.toISOString().slice(0, 10).replace(/-/g, "");

const requests = [];

for (let i = 0; i < days; i++) {
  const date = new Date(today);
  date.setUTCDate(today.getUTCDate() + i);

  const api = `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagues[league]}/scoreboard?dates=${format(date)}`;

  requests.push(
    fetch(api).then(async response => {
      if (!response.ok) {
        throw new Error(`ESPN HTTP ${response.status}`);
      }
      return response.json();
    })
  );
}

const results = await Promise.allSettled(requests);
const eventsMap = new Map();
let successfulDays = 0;

for (const result of results) {
  if (result.status === "fulfilled") {
    successfulDays++;

    for (const event of result.value.events || []) {
      eventsMap.set(event.id, event);
    }
  } else {
    console.error("ERROR ESPN:", result.reason);
  }
}

if (successfulDays === 0) {
  throw new Error("Todas las consultas a ESPN fallaron");
}

const events = [...eventsMap.values()]
  .filter(event => new Date(event.date) >= today)
  .sort((a, b) => new Date(a.date) - new Date(b.date));

res.writeHead(200, {
  "Content-Type": "application/json; charset=utf-8"
});

return res.end(JSON.stringify({ events }));
    );
    } catch (error) {
      
console.error("ERROR ESPN:", error);
      
      res.writeHead(502, {
        "Content-Type": "application/json"
      });
      return res.end(JSON.stringify({
        error: "No se pudo consultar ESPN"
      }));
    }
  }

 

const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(__dirname, "index.html");

fs.readFile(filePath, (error, html) => {
  if (error) {
    res.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    return res.end("No se pudo cargar NEXORA CAPITAL");
  }

  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8"
  });

    res.end(html);
});

});

server.listen(PORT, "0.0.0.0");
