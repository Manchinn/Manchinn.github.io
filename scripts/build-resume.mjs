#!/usr/bin/env node
/**
 * Build script for Manchinn.github.io/resume
 * 1. Validates all roles in resume/data.js against resume/index.html copy & skill slots.
 * 2. Pre-renders static ATS/crawler-friendly routes at resume/<role>/index.html.
 * 3. Pre-generates A4 PDFs at resume/pdf/<role>.pdf (and resume/pdf/th.pdf) via headless Chrome.
 * 4. Verifies every PDF is 1-2 pages A4 and zero undefined/empty fields exist.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const resumeDir = path.join(repoRoot, "resume");
const pdfDir = path.join(resumeDir, "pdf");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function findBrowser() {
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error("No headless Chrome/Edge executable found.");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadRoles() {
  const dataPath = path.join(resumeDir, "data.js");
  const code = fs.readFileSync(dataPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "data.js" });
  return sandbox.window.resumeRoles;
}

function extractRequiredKeys(html) {
  const copyKeys = [...html.matchAll(/data-role-copy="([^"]+)"/g)].map((m) => m[1]);
  const skillKeys = [...html.matchAll(/data-role-skill="([^"]+)"/g)].map((m) => m[1]);
  const optionKeys = [
    ...html.matchAll(/<select id="role-select"[\s\S]*?<\/select>/g),
  ]
    .flatMap((m) => [...m[0].matchAll(/<option value="([^"]+)"/g)])
    .map((m) => m[1]);

  const defaultSkillLabels = {};
  for (const m of html.matchAll(/<dt data-role-skill-label="([^"]+)">([^<]*)<\/dt>/g)) {
    defaultSkillLabels[m[1]] = m[2];
  }

  return { copyKeys, skillKeys, optionKeys, defaultSkillLabels };
}

function validateRoles(roles, { copyKeys, skillKeys, optionKeys }) {
  const errors = [];
  const roleKeys = Object.keys(roles);

  for (const opt of optionKeys) {
    if (!roles[opt]) errors.push(`Option "${opt}" in index.html missing in data.js`);
  }
  for (const rk of roleKeys) {
    if (!optionKeys.includes(rk)) errors.push(`Role "${rk}" in data.js missing <option> in index.html`);
  }

  for (const [roleKey, role] of Object.entries(roles)) {
    for (const field of ["title", "summaryPrefix", "summaryBody", "availability"]) {
      if (!role[field] || typeof role[field] !== "string" || role[field].includes("undefined")) {
        errors.push(`[${roleKey}] invalid or missing field "${field}"`);
      }
    }
    for (const sk of skillKeys) {
      if (!role.skills || !role.skills[sk] || role.skills[sk].includes("undefined")) {
        errors.push(`[${roleKey}] missing skill "${sk}"`);
      }
    }
    for (const ck of copyKeys) {
      if (!role.copy || !role.copy[ck] || role.copy[ck].includes("undefined")) {
        errors.push(`[${roleKey}] missing copy key "${ck}"`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("Validation FAILED:\n" + errors.map((e) => "  - " + e).join("\n"));
    process.exit(1);
  }
  console.log(`Validated ${roleKeys.length} roles x (${copyKeys.length} copy keys + ${skillKeys.length} skills): OK`);
}

function renderRoleHtml(templateHtml, roleKey, role, defaultSkillLabels) {
  const roleUrl = `https://manchinn.github.io/resume/${roleKey}/`;
  const pageTitle = `Chinnakrit Sripan Resume - ${role.title}`;
  const description = `${role.summaryPrefix} ${role.summaryBody}`.slice(0, 160).replace(/\s+\S*$/, "") + "...";

  let html = templateHtml;

  // Title, meta, canonical, OG, Twitter
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(pageTitle)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${roleUrl}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${roleUrl}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );

  // JSON-LD jobTitle & url
  html = html.replace(/"jobTitle":\s*"[^"]*"/, `"jobTitle": ${JSON.stringify(role.title)}`);
  html = html.replace(
    /"url":\s*"https:\/\/manchinn\.github\.io\/resume\/"/,
    `"url": ${JSON.stringify(roleUrl)}`
  );

  // Relative asset paths for /resume/<role>/index.html
  html = html.replace('href="style.css"', 'href="../style.css"');
  html = html.replace('src="profile.jpg"', 'src="../profile.jpg"');
  html = html.replace('src="data.js"', 'src="../data.js"');
  html = html.replace('src="script.js"', 'src="../script.js"');
  html = html.replace('href="th/"', 'href="../th/"');
  html = html.replace(
    'href="pdf/fullstack.pdf" download',
    `href="../pdf/${roleKey}.pdf" download="Chinnakrit-Sripan-${roleKey}.pdf"`
  );

  // Body attributes
  html = html.replace(
    'data-initial-role="fullstack" data-pdf-base="pdf/"',
    `data-initial-role="${roleKey}" data-pdf-base="../pdf/"`
  );

  // Selected option in role-select
  html = html.replace(/<option value="([^"]+)" selected>/g, '<option value="$1">');
  html = html.replace(
    new RegExp(`<option value="${roleKey}">`),
    `<option value="${roleKey}" selected>`
  );

  // Pre-rendered content
  html = html.replace(
    /<p class="title" data-role-title>[\s\S]*?<\/p>/,
    `<p class="title" data-role-title>${escapeHtml(role.title)}</p>`
  );
  html = html.replace(
    /<span data-role-summary-prefix>[\s\S]*?<\/span>/,
    `<span data-role-summary-prefix>${escapeHtml(role.summaryPrefix)} </span>`
  );
  html = html.replace(
    /<span data-role-summary-body>[\s\S]*?<\/span>/,
    `<span data-role-summary-body>${escapeHtml(role.summaryBody)}</span>`
  );
  html = html.replace(
    /<p data-role-availability>[\s\S]*?<\/p>/,
    `<p data-role-availability>${escapeHtml(role.availability)}</p>`
  );

  for (const [skillKey, skillValue] of Object.entries(role.skills)) {
    const label = (role.skillLabels && role.skillLabels[skillKey]) || defaultSkillLabels[skillKey] || skillKey;
    html = html.replace(
      new RegExp(`<dt data-role-skill-label="${skillKey}">[\\s\\S]*?<\\/dt>`),
      `<dt data-role-skill-label="${skillKey}">${escapeHtml(label)}</dt>`
    );
    html = html.replace(
      new RegExp(`<dd data-role-skill="${skillKey}">[\\s\\S]*?<\\/dd>`),
      `<dd data-role-skill="${skillKey}">${escapeHtml(skillValue)}</dd>`
    );
  }

  for (const [copyKey, copyValue] of Object.entries(role.copy)) {
    html = html.replace(
      new RegExp(`<li data-role-copy="${copyKey}">[\\s\\S]*?<\\/li>`),
      `<li data-role-copy="${copyKey}">${escapeHtml(copyValue)}</li>`
    );
  }

  if (html.includes(">undefined<")) {
    throw new Error(`Rendered HTML for "${roleKey}" contains "undefined"!`);
  }

  return html;
}

function countPdfPages(pdfPath) {
  const buf = fs.readFileSync(pdfPath);
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page\b(?!s)/g);
  return matches ? matches.length : 0;
}

function generatePdf(browserPath, htmlPath, pdfPath) {
  const fileUrl = pathToFileURL(htmlPath).href;
  execFileSync(
    browserPath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--no-pdf-header-footer",
      `--print-to-pdf=${pdfPath}`,
      fileUrl,
    ],
    { stdio: "pipe" }
  );
  return countPdfPages(pdfPath);
}

function main() {
  const templateHtml = fs.readFileSync(path.join(resumeDir, "index.html"), "utf8");
  const roles = loadRoles();
  const required = extractRequiredKeys(templateHtml);
  validateRoles(roles, required);

  fs.mkdirSync(pdfDir, { recursive: true });
  const browserPath = findBrowser();
  console.log(`Using headless browser: ${browserPath}`);

  const results = [];
  for (const [roleKey, role] of Object.entries(roles)) {
    const roleDir = path.join(resumeDir, roleKey);
    fs.mkdirSync(roleDir, { recursive: true });
    const outHtmlPath = path.join(roleDir, "index.html");
    const rendered = renderRoleHtml(templateHtml, roleKey, role, required.defaultSkillLabels);
    fs.writeFileSync(outHtmlPath, rendered, "utf8");

    const outPdfPath = path.join(pdfDir, `${roleKey}.pdf`);
    const pages = generatePdf(browserPath, outHtmlPath, outPdfPath);
    const sizeKb = Math.round(fs.statSync(outPdfPath).size / 1024);
    results.push({ roleKey, pages, sizeKb });
    if (pages < 1 || pages > 2) {
      throw new Error(`PDF for ${roleKey} has ${pages} pages (expected 1-2 A4 pages)!`);
    }
  }

  // Also generate Thai PDF
  const thHtmlPath = path.join(resumeDir, "th", "index.html");
  if (fs.existsSync(thHtmlPath)) {
    const thPdfPath = path.join(pdfDir, "th.pdf");
    const pages = generatePdf(browserPath, thHtmlPath, thPdfPath);
    const sizeKb = Math.round(fs.statSync(thPdfPath).size / 1024);
    results.push({ roleKey: "th", pages, sizeKb });
    if (pages < 1 || pages > 2) {
      throw new Error(`Thai PDF has ${pages} pages (expected 1-2 A4 pages)!`);
    }
  }

  console.log("\nGenerated static routes & PDFs:");
  for (const r of results) {
    console.log(`  - ${r.roleKey.padEnd(24)} ${r.pages} page(s)  (${r.sizeKb} KB)`);
  }
  console.log("\nAll builds and checks passed.");
}

main();
