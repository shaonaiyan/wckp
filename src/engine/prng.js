// 可复现随机数生成器 (Mulberry32 + MurmurHash3 种子初始化)
export class RandomManager {
  constructor(seed) {
    this.initialSeed = seed !== undefined ? seed : RandomManager.generateRandomSeed();
    this.seed = this.initialSeed;
    this.state = this._hashSeed(this.seed);
    this.callCount = 0;
  }

  static generateRandomSeed() {
    return Math.floor(Math.random() * 2147483647).toString(16);
  }

  _hashSeed(seed) {
    let str = String(seed);
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }

  // 重置回初始种子状态
  reset(seed) {
    if (seed !== undefined) {
      this.initialSeed = seed;
      this.seed = seed;
    }
    this.state = this._hashSeed(this.seed);
    this.callCount = 0;
  }

  // 核心 Mulberry32 PRNG，输出 [0, 1) 的伪随机浮点数
  nextFloat() {
    this.callCount++;
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // 整数范围 [min, max] 包含两端
  nextInt(min, max) {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  // 数组随机挑选
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(this.nextFloat() * array.length)];
  }

  // 按权重加权随机挑选
  // items: [{ item, weight }, ...]
  weightedChoice(items) {
    if (!items || items.length === 0) return null;
    const totalWeight = items.reduce((sum, i) => sum + Math.max(0, i.weight), 0);
    if (totalWeight <= 0) return items[0].item;
    
    let threshold = this.nextFloat() * totalWeight;
    for (const entry of items) {
      threshold -= Math.max(0, entry.weight);
      if (threshold <= 0) {
        return entry.item;
      }
    }
    return items[items.length - 1].item;
  }

  // 洗牌 (Fisher-Yates)
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.nextFloat() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
