import { execSync, spawn } from 'child_process';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { writeFile } from 'fs/promises';

// 章节顺序（与 sidebar 一致）
const chapters = [
  '/part1/chapter1/',
  '/part1/chapter2/',
  '/part1/chapter3/',
  '/part1/chapter4/',
  '/part1/chapter5/',
  '/part1/chapter6/',
  '/part2/chapter7/',
  '/part2/chapter8/',
  '/part2/chapter9/',
  '/part2/chapter10/',
  '/part2/chapter11/',
  '/part2/chapter12/',
  '/part2/chapter13/',
  '/part3/chapter14/',
];

const BASE = '/hello-generic-agent';
const PORT = 4173; // vitepress preview port
const OUTPUT_DIR = 'pdf-output';
const FINAL_PDF = 'hello-generic-agent.pdf';

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server not ready at ${url} after ${timeout}ms`);
}

async function main() {
  // 1. Build VitePress
  console.log('📦 Building VitePress site...');
  execSync('npm run docs:build', { stdio: 'inherit' });

  // 2. Start preview server
  console.log('🚀 Starting preview server...');
  const server = spawn('npx', ['vitepress', 'preview', 'docs', '--port', String(PORT)], {
    stdio: 'pipe',
    detached: false,
  });

  const baseUrl = `http://localhost:${PORT}${BASE}`;
  await waitForServer(baseUrl);
  console.log(`✅ Server ready at ${baseUrl}`);

  // 3. Launch Puppeteer
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const pdfBuffers = [];

  for (const chapter of chapters) {
    const url = `http://localhost:${PORT}${BASE}${chapter}`;
    console.log(`📄 Exporting: ${chapter}`);
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    // Hide sidebar and nav for cleaner PDF
    await page.addStyleTag({
      content: `
        .VPSidebar, .VPNav, .VPFooter, .edit-link, .prev-next { display: none !important; }
        .VPDoc { padding-left: 0 !important; }
        .VPContent { max-width: 100% !important; padding: 0 40px !important; }
        @media print {
          .VPSidebar, .VPNav, .VPFooter, .edit-link, .prev-next { display: none !important; }
        }
      `,
    });

    // Wait for images and math to render
    await page.waitForTimeout(2000);

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    pdfBuffers.push(pdf);
    await page.close();
  }

  await browser.close();
  server.kill();

  // 4. Merge PDFs
  console.log('📎 Merging PDFs...');
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const doc = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => mergedPdf.addPage(p));
  }

  mergedPdf.setTitle('Hello Generic Agent 教程');
  mergedPdf.setAuthor('Datawhale');
  mergedPdf.setSubject('从安装到原理，全面掌握 Generic Agent');

  const mergedBytes = await mergedPdf.save();
  await writeFile(FINAL_PDF, mergedBytes);
  console.log(`✅ Done! Output: ${FINAL_PDF} (${(mergedBytes.length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});