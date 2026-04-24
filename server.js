import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// 👇 THIS serves your whole frontend
app.use(express.static("public"));

// homepage
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

// apply page
app.get("/apply", (req, res) => {
  res.sendFile("apply.html", { root: "./public" });
});

// API
app.post("/api/apply", (req, res) => {
  console.log(req.body);

  return res.json({ qualified: true });
});

app.listen(3000, () => {
  console.log("Server running");
});
