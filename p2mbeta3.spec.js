import { test, expect } from '@playwright/test';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

// ✅ Run only in Chromium
test.use({ browserName: 'chromium' });

// ✅ Disable timeout globally for this file
test.setTimeout(120000);

// ✅ Read CSV file
const records = parse(fs.readFileSync('p2mbetapitch.csv'), {
    columns: true,
    skip_empty_lines: true
});

// ✅ Run tests in parallel
test.describe.configure({ mode: 'parallel' });

// 👉 Create ONE test per CSV row
records.forEach((user) => {

    test(`Ticket Purchase + Pitch Submission for ${user.Email}`, async ({ page }) => {

        // 👉 Skip invalid rows
        if (!user.Email || !user.Password || !user.Pitch) {
            console.log('Skipping invalid row:', user);
            return;
        }

        // 👉 Random ticket quantity between 1 and 5
        const randomTicketCount = Math.floor(Math.random() * 5) + 1;

        // 👉 Log start
        console.log(
            `Running test for ${user.Email} with ${randomTicketCount} ticket(s)`
        );

        // ============================================================
        // LOGIN
        // ============================================================

        await page.goto(
            'https://beta.pitchtomatch.com/events/G0KOyva8ox?key=emj9kbEeNLYo9Wlw'
        );

        await page
            .getByRole('navigation')
            .getByRole('link', { name: 'Login' })
            .click();

        await page
            .getByRole('textbox', { name: 'Email Address' })
            .fill(user.Email);

        await page
            .getByRole('textbox', { name: 'Password' })
            .fill(user.Password);

        await page
            .getByRole('button', { name: 'Login' })
            .click();

        // ============================================================
        // PURCHASE TICKET
        // ============================================================

        await page
            .getByRole('button', { name: 'Purchase Ticket · €' })
            .click();

        // 👉 Increase ticket quantity randomly
        for (let i = 1; i < randomTicketCount; i++) {

            await page
                .getByRole('button')
                .filter({ hasText: /^$/ })
                .nth(4)
                .click();
        }

        // 👉 Apply promo code
        await page
            .getByRole('textbox', { name: 'Enter promo code' })
            .fill('Discount');

        await page
            .getByRole('button', { name: 'Apply' })
            .click();

        // ============================================================
        // JOIN EVENT
        // ============================================================

        await page
            .getByRole('button', { name: 'Join Event' })
            .click();

        // 👉 Verify joined successfully
        await expect(
            page.getByText('Joined')
        ).toBeVisible();

        console.log(
            `${user.Email} joined successfully with ${randomTicketCount} ticket(s)`
        );

        // ============================================================
        // SUBMIT PITCH
        // ============================================================

        await page
            .getByRole('link', { name: 'Pitch', exact: true })
            .click();

        await page
            .getByRole('button', { name: 'Text Pitch' })
            .click();

        await page
            .getByRole('textbox', { name: 'Enter Your Pitch' })
            .fill(user.Pitch);

        await page
            .getByRole('checkbox', {
                name: 'I acknowledge that my text'
            })
            .check();

        await page
            .getByRole('button', {
                name: 'Submit Text Pitch'
            })
            .click();

        // ============================================================
        // VERIFY SUCCESS
        // ============================================================

        await expect(
            page.locator('.w-12')
        ).toBeVisible();

        console.log(
            `Success for ${user.Email} - Pitch submitted`
        );

    });

});