export class XorShift32 {
  private state: number;

  constructor(seed: string) {
    this.state = XorShift32.hash(seed) || 0x9e3779b9;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 0xffffffff;
  }

  id(prefix: string): string {
    return `${prefix}_${Math.floor(this.next() * 1_000_000_000).toString(36)}`;
  }

  private static hash(input: string): number {
    let h = 2166136261;
    for (const char of input) {
      h ^= char.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
}
