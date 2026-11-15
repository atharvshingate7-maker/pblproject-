import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = '/Users/atharvbharatshingate/.gemini/antigravity-ide/brain/78fcc049-050d-432f-9bf0-4b4e78f7f4e4';

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('Browser console error:', msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.log('Page error:', err.toString());
  });

  console.log('Step 1: Navigate to http://localhost:5173/login');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, '01_login.png') });

  console.log('Step 2: Sign in as Atharv Shingate');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => window.location.pathname === '/dashboard', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Current URL after login:', page.url());
  await page.screenshot({ path: path.join(outDir, '02_dashboard.png') });

  console.log('Step 3: Test Sidebar Toggle Button');
  // Topbar has sidebar toggle button
  const toggleBtn = await page.$('button[title="Toggle Navigation Sidebar"]');
  if (toggleBtn) {
    console.log('Clicking sidebar toggle to collapse...');
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 500));
    console.log('URL after toggle click (must still be /dashboard):', page.url());
    await page.screenshot({ path: path.join(outDir, '03_sidebar_collapsed.png') });

    console.log('Clicking sidebar toggle to expand again...');
    await toggleBtn.click();
    await new Promise(r => setTimeout(r, 500));
  } else {
    console.log('Warning: toggleBtn not found');
  }

  console.log('Step 4: Test Bell Notification Center');
  const bellBtn = await page.$('button[aria-label="Open notifications"]');
  if (bellBtn) {
    await bellBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, '04_notifications.png') });
    // Click again to close
    await bellBtn.click();
    await new Promise(r => setTimeout(r, 300));
  } else {
    console.log('Warning: bellBtn not found');
  }

  console.log('Step 5: Test Profile Dropdown');
  const profileBtn = await page.$('button[aria-label="User profile menu"]');
  if (profileBtn) {
    await profileBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, '05_profile_menu.png') });
    await profileBtn.click();
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('Step 6: Navigate to /reports');
  await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '06_reports.png') });

  // Test Download PDF
  const downloadBtns = await page.$$('button');
  for (const b of downloadBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Download PDF')) {
      console.log('Clicking Download PDF button...');
      await b.click();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(outDir, '07_report_download_toast.png') });
      break;
    }
  }

  console.log('Step 7: Navigate to /cases');
  await page.goto('http://localhost:5173/cases', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '08_cases.png') });

  console.log('Step 8: Navigate to /cases/CY-2024-047/analysis');
  await page.goto('http://localhost:5173/cases/CY-2024-047/analysis', { waitUntil: 'networkidle0' });
  // Wait for AI analysis loader to complete (1.4s delay)
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(outDir, '09_analysis_summary.png') });

  // Click Inconsistencies tab
  const tabs = await page.$$('button');
  for (const t of tabs) {
    const text = await page.evaluate(el => el.textContent, t);
    if (text.includes('Inconsistencies')) {
      console.log('Clicking Inconsistencies tab...');
      await t.click();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(outDir, '10_analysis_inconsistencies.png') });
      break;
    }
  }

  console.log('Step 8b: Navigate to /cases/new (Register Cyber Case)');
  await page.goto('http://localhost:5173/cases/new', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '12_create_case.png') });

  console.log('Step 8c: Navigate to /cases/CY-2024-047/upload (Upload Forensic Evidence)');
  await page.goto('http://localhost:5173/cases/CY-2024-047/upload', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '13_upload_evidence.png') });

  console.log('Step 9: Test Logout');
  const profBtn = await page.$('button[aria-label="User profile menu"]');
  if (profBtn) {
    await profBtn.click();
    await new Promise(r => setTimeout(r, 400));
    // Click Sign Out
    const signoutBtn = await page.$('button');
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Sign Out')) {
        console.log('Clicking Sign Out button...');
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    console.log('URL after logout:', page.url());
    await page.screenshot({ path: path.join(outDir, '11_after_logout.png') });
  }

  console.log('Step 10: Test Protected Route Guard (Navigate to /dashboard while logged out)');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  console.log('URL after attempting /dashboard while logged out:', page.url());
  const isBlocked = page.url().includes('/login');
  console.log('Protected route guard passed:', isBlocked);

  console.log('All steps completed! Total console errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console errors encountered:', consoleErrors);
  }

  await browser.close();
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
