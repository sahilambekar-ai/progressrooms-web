import {test,expect} from './fixtures';
test('auth page responses include safe embedding and referrer headers',async({page})=>{
 const response=await page.goto('/login');const headers=response!.headers();
 expect(headers['x-content-type-options']).toBe('nosniff');expect(headers['referrer-policy']).toBe('same-origin');expect(headers['x-frame-options']).toBe('SAMEORIGIN');expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
 if(process.env.PLAYWRIGHT_PRODUCTION==='1')expect(headers['strict-transport-security']).toBe('max-age=31536000');
});
