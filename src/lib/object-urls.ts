/** Bound preview URLs and promptly release downloaded blobs, including on unmount. */
export class ObjectUrlPool {
  private urls = new Set<string>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  constructor(private maximum = 5) {}
  create(blob: Blob, lifetimeMs?: number) {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    while (this.urls.size > this.maximum) this.release(this.urls.values().next().value!);
    if (lifetimeMs !== undefined) this.timers.set(url, setTimeout(() => this.release(url), lifetimeMs));
    return url;
  }
  release(url: string) {
    clearTimeout(this.timers.get(url)); this.timers.delete(url);
    if (this.urls.delete(url)) URL.revokeObjectURL(url);
  }
  dispose() { for (const url of this.urls) this.release(url); }
}
