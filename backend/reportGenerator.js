const fs = require("fs-extra");
const path = require("path");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");
const jp = require("jsonpath");

const CONFIG_PATH = path.join(__dirname, "config", "assessments.json");
const TEMPLATE_DIR = path.join(__dirname, "templates");
const OUTPUT_DIR = path.join(__dirname, "generated_reports");

async function generateReport(sessionRecord) {
  const configs = fs.readJSONSync(CONFIG_PATH);
  const cfg = configs.find(c => c.assessment_id === sessionRecord.assessment_id);
  if (!cfg) throw new Error("No config for assessment_id " + sessionRecord.assessment_id);

  const renderedSections = cfg.sections.map(section => {
    const fields = section.fields.map(f => {
      let value;
      try { value = jp.query(sessionRecord, f.path)[0]; } catch (e) { value = undefined; }

      let classificationLabel = null;
      if (f.classify && cfg.classifications && cfg.classifications[f.classify]) {
        const ranges = cfg.classifications[f.classify];
        if (typeof value === "number") {
          for (const r of ranges) {
            if (value >= r.min && value <= r.max) {
              classificationLabel = r.label;
              break;
            }
          }
        }
      }

      return { label: f.label, value, classification: classificationLabel };
    });
    return { title: section.title, fields };
  });

  const context = {
    session: sessionRecord,
    displayName: cfg.displayName,
    sections: renderedSections,
    generatedAt: new Date().toLocaleString()
  };

  const templatePath = path.join(TEMPLATE_DIR, (cfg.template || "basicReport") + ".hbs");
  const templateSrc = fs.readFileSync(templatePath, "utf-8");
  const template = Handlebars.compile(templateSrc);
  const html = template(context);

  fs.ensureDirSync(OUTPUT_DIR);
  const pdfPath = path.join(OUTPUT_DIR, `${sessionRecord.session_id}.pdf`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4' });
  await browser.close();

  return { pdfPath };
}

module.exports = { generateReport };
