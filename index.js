import express from "express";
import path from "path";

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ================= APPLY PAGE ROUTE ================= */
app.get("/apply", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public/apply.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
