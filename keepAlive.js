import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("🤖 Bot is alive!");
});

export function keepAlive() {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`✅ keepAlive server started on port ${PORT}`),
  );
}
