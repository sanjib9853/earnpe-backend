import express from "express";
import admin from "firebase-admin";

import serviceAccount from "./firebase-service-account.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
});

const db = admin.database();
const app = express();
app.use(express.json());

// PubScale callback API
app.post("/reward", async (req, res) => {
  try {
    const { userId, reward } = req.body;

    if (!userId || !reward) {
      return res.status(400).json({ error: "Missing userId or reward" });
    }

    const userRef = db.ref("users/" + userId + "/points");
    const historyRef = db.ref("users/" + userId + "/history");

    // Add points safely
    await userRef.transaction(points => (points || 0) + reward);

    // Add history
    historyRef.push({
      note: "App Install Reward",
      points: reward,
      ts: Date.now()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Root Check
app.get("/", (req, res) => {
  res.send("EarnPe Backend Running ✔");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server Running on " + PORT));
