import AxeBuilder from '@axe-core/playwright';
import { test, expect, auth, summary } from './fixtures';
for (const path of ['/login','/register?role=STUDENT','/register?role=STUDIO','/privacy','/pricing-policy']) {
 test(`WCAG A/AA checks ${path}`, async ({ page }) => {
  await page.goto(path); await expect(page.locator('body')).toBeVisible();
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
 });
}
test('privacy dialog keyboard focus is contained, Escape closes and returns focus without consenting',async ({page})=>{
 await page.goto('/register?role=STUDENT'); const link=page.getByRole('link',{name:'Click here to read more'}); await link.focus();await page.keyboard.press('Enter');
 const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
 for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(e=>e.contains(document.activeElement))).toBe(true);}
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(link).toBeFocused();await expect(page.getByRole('checkbox')).not.toBeChecked();
});
test('native checkout dialog and billing controls are accessible',async ({page})=>{
 await auth(page);await page.goto('http://127.0.0.1:3111/');await expect(page.getByRole('dialog')).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.route('**/api/v1/organizations/studio-1/saas-billing',r=>r.fulfill({json:summary}));await page.goto('http://127.0.0.1:3111/?view=billing');await expect(page.getByRole('combobox')).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});
