import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:4000";

export default function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // Optionally fetch sessions from backend dynamically
  useEffect(() => {
    setSessions(["sess-001", "sess-002"]); // Replace with API call if available
  }, []);

  const handleAuth = async () => {
    if (!email || !password || (mode === "signup" && !name)) {
      setMessage("❌ Please fill all fields");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage("❌ Invalid email format");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "login" ? "/login" : "/signup";
      const res = await axios.post(API + endpoint, { email, password, name });
      setToken(res.data.token);
      setMessage("✅ Welcome " + res.data.user.name);
      setEmail(""); setPassword(""); setName("");
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const generateReport = async () => {
    if (!selectedSession) {
      setMessage("❌ Select a session first");
      return;
    }
    setLoadingReport(true);
    setMessage("");

    try {
      const res = await axios.post(
        API + "/generate-report",
        { session_id: selectedSession },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pdfUrl = API + "/reports/" + selectedSession + ".pdf";
      setMessage("✅ PDF generated successfully");
      window.open(pdfUrl, "_blank");
    } catch (err) {
      setMessage("❌ Report error: " + (err.response?.data?.error || err.message));
    }
    setLoadingReport(false);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-4 bg-gray-50">
        <h1 className="text-3xl font-bold">{mode === "login" ? "Login" : "Signup"}</h1>

        {mode === "signup" && (
          <input
            className="border p-2 w-72 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="border p-2 w-72 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-72 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="bg-blue-500 text-white px-4 py-2 w-72 rounded hover:bg-blue-600 disabled:opacity-50"
          onClick={handleAuth}
          disabled={loading}
        >
          {loading ? "Processing..." : mode === "login" ? "Login" : "Signup"}
        </button>

        <button
          className="text-sm text-gray-500"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          Switch to {mode === "login" ? "Signup" : "Login"}
        </button>

        {message && (
          <p className={message.startsWith("✅") ? "text-green-500" : "text-red-500"}>{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
  <h1 className="text-2xl font-bold mb-4">Generate Reports</h1>

  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
    <select
      className="border p-2 rounded w-full sm:w-64"
      value={selectedSession}
      onChange={(e) => setSelectedSession(e.target.value)}
    >
      <option value="">-- Select Session --</option>
      {sessions.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>

    <button
      className={`px-4 py-2 rounded text-white ${loadingReport ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
      onClick={generateReport}
      disabled={loadingReport || !selectedSession}
    >
      {loadingReport ? "Generating..." : "Generate PDF"}
    </button>
  </div>

  {message && (
    <p
      className={`mt-2 font-medium ${
        message.startsWith("✅") ? "text-green-600" : "text-red-600"
      }`}
    >
      {message}
    </p>
  )}

  {selectedSession && !loadingReport && message.startsWith("✅") && (
    <p className="mt-2 text-gray-700 text-sm">
      Click the button again if the PDF didn't open automatically.
    </p>
  )}
</div>

  );
}
