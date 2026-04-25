import express from "express";
import applyRoutes from "./api/apply.js";
import checkoutRoutes from "./api/create-checkout.js";

const app = express();

app.use(express.json());

app.use("/api", applyRoutes);
app.use("/api", checkoutRoutes);

app.get("/", (req, res) => {
  res.send("RoofFlow API running");
});

app.listen(process.env.PORT || 3000);
