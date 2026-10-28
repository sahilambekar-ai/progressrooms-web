import { writeFileSync } from 'node:fs';
import { test, expect, auth, summary } from './fixtures';
test('repeated checkout and billing unmounts release DOM and listeners',async ({page},testInfo)=>{
 await auth(page);await page.route('**/api/v1/organizations/studio-1/saas-billing',r=>r.fulfill({json:summary}));
 await page.goto('http://127.0.0.1:3111/?view=cycles');
 const cdp=await page.context().newCDPSession(page);
 const cycle=async()=>{
  await page.getByRole('button',{name:'Mount checkout',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close modal',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Mount billing',exact:true}).click();await expect(page.getByRole('combobox')).toBeVisible();await page.getByRole('button',{name:'Unmount',exact:true}).click();await expect(page.getByRole('combobox')).toHaveCount(0);
 };
 for(let i=0;i<5;i++)await cycle();
 const sample=async()=>{await cdp.send('HeapProfiler.collectGarbage');return {heap:await cdp.send('Runtime.getHeapUsage'),dom:await cdp.send('Memory.getDOMCounters')};};
 const before=await sample();for(let i=0;i<25;i++)await cycle();const after=await sample();
 const result={cycles:30,before,after};writeFileSync(testInfo.outputPath('browser-memory.json'),JSON.stringify(result,null,2));await testInfo.attach('memory-cycles',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 expect(after.dom.nodes).toBeLessThanOrEqual(before.dom.nodes+30);expect(after.dom.jsEventListeners).toBeLessThanOrEqual(before.dom.jsEventListeners+20);expect(after.heap.usedSize).toBeLessThan(before.heap.usedSize+3_000_000);
});
