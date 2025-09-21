// Only declare generateReport once
const { generateReport } = require("./reportGenerator");

(async () => {
  const sessions = [
    {
      session_id: "sess-001",
      assessment_id: "default",
      candidate: { name: "Test User" }
    },
    {
      session_id: "sess-002",
      assessment_id: "default",
      candidate: { name: "Second User" }
    }
  ];

  for (const sessionRecord of sessions) {
    try {
      const result = await generateReport(sessionRecord);
      console.log(`✅ PDF generated for ${sessionRecord.session_id}:`, result.pdfPath);
    } catch (err) {
      console.error(`❌ Error generating PDF for ${sessionRecord.session_id}:`, err.message);
    }
  }
})();
