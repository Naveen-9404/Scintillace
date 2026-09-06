const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("Navigating to frontend...");
    await page.goto('http://localhost:5173/events', { waitUntil: 'networkidle' });
    
    // Find an event
    console.log("Looking for events...");
    await page.waitForSelector('text=Explore Events', { timeout: 5000 });
    
    // Click on the first event link
    const eventLink = await page.$('a[href^="/events/"]');
    if (!eventLink) {
        console.log("No event link found on /events page.");
        return;
    }
    
    const href = await eventLink.getAttribute('href');
    console.log(`Clicking on event link: ${href}`);
    await eventLink.click();

    // Click register
    console.log("Clicking 'Register' button...");
    await page.waitForTimeout(2000);
    const registerButton = await page.$('a:has-text("Register Now")');
    if (registerButton) {
        await registerButton.click();
    } else {
        const directLink = await page.$('a[href$="/register"]');
        if (directLink) {
            await directLink.click();
        } else {
            console.log("Could not find Register button.");
            return;
        }
    }

    console.log("Filling form...");
    await page.waitForTimeout(2000);
    
    // Check if it's open
    const isClosed = await page.$('text=Registration for this event is currently closed');
    if (isClosed) {
        console.log("Registration is closed for this event.");
        return;
    }

    // Try finding by exact label text since standard selectors might fail if DOM structure is different
    // Let's use evaluate to find inputs by their preceding label
    await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('label'));
        labels.forEach(l => {
            const text = l.textContent.trim();
            const input = l.nextElementSibling;
            if (!input || (input.tagName !== 'INPUT' && input.tagName !== 'SELECT')) return;
            
            if (text.includes('Full Name')) input.value = 'Playwright Tester';
            if (text.includes('Email')) input.value = 'playwright@example.com';
            if (text.includes('Mobile Number')) input.value = '9876543210';
            if (text.includes('College')) input.value = 'Test College';
            if (text.includes('Department')) input.value = 'Test Dept';
            
            // Dispatch event to trigger React onChange
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        });
        
        // Select year
        const select = document.querySelector('select');
        if (select) {
            select.value = '1st Year';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    console.log("Submitting form...");
    const submitBtn = await page.$('button:has-text("Continue to Payment")');
    if (submitBtn) {
        await submitBtn.click();
    } else {
        console.log("Could not find 'Continue to Payment' button.");
    }
    
    console.log("Waiting for network or UI changes...");
    await page.waitForTimeout(3000);
    
    const paymentText = await page.$('text=Complete Your Payment');
    const successText = await page.$('text=Registration Submitted');
    
    // Let's grab all text on the screen to see if there's an error message.
    const bodyText = await page.innerText('body');
    
    if (paymentText) {
        console.log("SUCCESS: Transitioned to Payment step.");
    } else if (successText) {
        console.log("SUCCESS: Transitioned to Success step (free event).");
    } else {
        console.log("UI didn't transition properly. Dumping screen text:");
        console.log(bodyText.substring(0, 1000));
        await page.screenshot({ path: 'registration_stuck.png' });
    }
    
  } catch (err) {
    console.error("Script failed:", err);
  } finally {
    await browser.close();
  }
})();
