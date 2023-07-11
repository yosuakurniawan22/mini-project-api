import "dotenv/config";
import express from "express";
import database from "./db";
import routes from "./routes";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/static', express.static('uploads'));

database.sync({ force: true})
.then(() => {
  console.info("database synced");
})
.catch((err) => {
  console.error("failed to sync database: " + err.message);
});

app.get("/", (req, res) => {
  res.json({ message: "test server" });
});

app.use("/api/v1", Object.values(routes));

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
});
