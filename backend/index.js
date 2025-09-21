const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { generateReport } = require("./reportGenerator");
const data = require("./data");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_PATH = path.join(__dirname, "users.json");
fs.ensureFileSync(USERS_PATH);
if (!fs.readJSONSync(USERS_PATH, { throws: false })) fs.writeJSONSync(USERS_PATH, []);

const JWT_SECRET = "supersecret"; // replace with env var in production

// Signup
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  const users = fs.readJSONSync(USERS_PATH);
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "User exists" });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, name, passwordHash: hash };
  users.push(user);
  fs.writeJSONSync(USERS_PATH, users);
  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email, name } });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = fs.readJSONSync(USERS_PATH);
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "No user" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid" });
  const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Generate report
app.post("/generate-report", async (req, res) => {
  const { session_id } = req.body;
  const sessionRecord = data.find(d => d.session_id === session_id); // use your actual data array
  if (!sessionRecord) return res.status(404).json({ error: "Session not found" });

  try {
    console.log("Generating report for:", sessionRecord);
    const result = await generateReport(sessionRecord);
    res.json({ success: true, file: result.pdfPath });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ error: err.message });
  }
});



// Serve PDFs
app.use("/reports", express.static(path.join(__dirname, "generated_reports")));

const PORT = 4000;
app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
