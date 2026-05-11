import express from "express";
import cors from "cors";

import db from "./app/models/index.js";
import authRoutes from "./app/routes/auth.routes.js";
import userRoutes from "./app/routes/user.routes.js";
import dbConfig from "./app/config/db.config.js";

const app = express();

const allowedOrigins = ["http://localhost:8080", "http://localhost:5173"];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS."));
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Node.js JWT Authentication API." });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", userRoutes);

const PORT = process.env.PORT || 3000;

const seedRoles = async () => {
  await db.role.findOrCreate({
    where: { name: "user" },
    defaults: { id: 1, name: "user" },
  });
  await db.role.findOrCreate({
    where: { name: "moderator" },
    defaults: { id: 2, name: "moderator" },
  });
  await db.role.findOrCreate({
    where: { name: "admin" },
    defaults: { id: 3, name: "admin" },
  });
};

db.sequelize
  .sync({ force: false })
  .then(async () => {
    await seedRoles();
    console.log("Database synchronized");
    console.log(`Connected to MySQL database "${dbConfig.DB}" on ${dbConfig.HOST}:${dbConfig.PORT}`);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });
