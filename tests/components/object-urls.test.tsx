import { expect,it,vi } from 'vitest';
import { ObjectUrlPool } from '../../src/lib/object-urls';
it('bounds preview blobs and releases downloads and unmounted resources exactly once',()=>{
 vi.useFakeTimers();let sequence=0;
 const create=vi.fn(()=>`blob:test-${++sequence}`),revoke=vi.fn();
 vi.stubGlobal('URL',Object.assign(class {},{createObjectURL:create,revokeObjectURL:revoke}));
 try {
  const pool=new ObjectUrlPool(2);const blob=new Blob(['html']);
  pool.create(blob);pool.create(blob);pool.create(blob);expect(revoke).toHaveBeenCalledWith('blob:test-1');
  const download=pool.create(blob,1000);vi.advanceTimersByTime(1000);expect(revoke).toHaveBeenCalledWith(download);
  pool.dispose();expect(revoke.mock.calls.map(call=>call[0]).sort()).toEqual(['blob:test-1','blob:test-2','blob:test-3','blob:test-4']);expect(vi.getTimerCount()).toBe(0);
 } finally {vi.useRealTimers();}
});
