import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());              // allow all origins, or lock to your github.io origin
app.use(express.json());

const ASTRA_HOST = "https://astra.datastax.com";

// Proxy all Langflow/Astra calls
app.all("/langflow/*", async (req, res) => {
  try {
    const pathAfter = req.path.replace("/langflow", ""); // keep original path
    const query = req.url.split(pathAfter)[1] || "";
    const targetUrl = ASTRA_HOST + pathAfter + query;

    const lfRes = await fetch(targetUrl, {
      method: req.method,
      headers: {
        // Forward relevant headers, but **not** Origin/Host
        "Content-Type": req.headers["content-type"] || "application/json",
        authorization: req.headers["authorization"] || ""
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const contentType = lfRes.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);

    const buffer = await lfRes.arrayBuffer();
    res.status(lfRes.status).send(Buffer.from(buffer));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Proxy error", details: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Langflow proxy listening on port", PORT);
});
