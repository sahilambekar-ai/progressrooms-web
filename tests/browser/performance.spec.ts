import { writeFileSync } from 'node:fs';
import { test, expect } from './fixtures';
test('records local page paint and layout samples',async({page},testInfo)=>{
 const samples=[];
 for(const path of ['/login','/register?role=STUDENT','/privacy']) {
  await page.addInitScript(()=>{
   const data={lcp:0,cls:0};(window as unknown as {auditPaint:typeof data}).auditPaint=data;
   new PerformanceObserver(list=>{for(const e of list.getEntries())data.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries()){const shift=e as PerformanceEntry & {hadRecentInput:boolean;value:number};if(!shift.hadRecentInput)data.cls+=shift.value;}}).observe({type:'layout-shift',buffered:true});
  });
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await page.evaluate(async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  const result=await page.evaluate(()=>{
   const nav=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
   return {...(window as unknown as {auditPaint:{lcp:number;cls:number}}).auditPaint,ttfb:nav.responseStart-nav.requestStart,domContentLoaded:nav.domContentLoadedEventEnd,transferBytes:nav.transferSize};
  });
  expect(result.cls).toBeLessThanOrEqual(.1);samples.push({path,...result});
 }
 const result={production:process.env.PLAYWRIGHT_PRODUCTION==='1',local:true,samples};writeFileSync(`/private/tmp/item7-page-metrics-${testInfo.project.name}.json`,JSON.stringify(result,null,2));await testInfo.attach('local-page-metrics',{body:JSON.stringify(result,null,2),contentType:'application/json'});
});
