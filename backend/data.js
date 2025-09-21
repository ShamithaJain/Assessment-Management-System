// backend/data.js
module.exports = [
  {
    session_id: "sess-001",
    assessment_id: "A-100",
    session_date: "2025-09-12",
    participant: { name: "Asha Rao", age: 45 },
    responses: {
      memory: { score: 18 },
      attention: { score: 16 }
    }
  },
  {
    session_id: "sess-002",
    assessment_id: "B-200",
    session_date: "2025-08-20",
    participant: { name: "Rohit Kumar", age: 29 },
    summary: { overview: "Calm and reflective" },
    traits: { openness: 72, conscientiousness: 58 }
  }
];
