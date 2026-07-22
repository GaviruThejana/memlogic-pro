export type AlgorithmType = 'FIFO' | 'LRU' | 'LFU' | 'MFU';

export interface SimulationStep {
  index: number;
  page: string;
  isHit: boolean;
  frames: (string | null)[];
  replacedPage: string | null;
  reason: string;
}

export interface SimulationResult {
  steps: SimulationStep[];
  faults: number;
  hits: number;
  hitRatio: number;
  faultPercentage: number;
  efficiencyScore: number;
}

export function simulate(
  algorithm: AlgorithmType,
  referenceString: string[],
  numFrames: number
): SimulationResult {
  let frames: (string | null)[] = Array(numFrames).fill(null);
  const steps: SimulationStep[] = [];
  let faults = 0;
  let hits = 0;

  // Helpers for algorithms
  const lruTrack: Map<string, number> = new Map();
  const freqTrack: Map<string, number> = new Map();
  const fifoQueue: string[] = [];

  referenceString.forEach((page, index) => {
    const isHit = frames.includes(page);
    let replacedPage: string | null = null;
    let reason = '';

    if (isHit) {
      hits++;
      reason = 'Page already in memory.';
      if (algorithm === 'LRU') {
        lruTrack.set(page, index);
      }
      if (algorithm === 'LFU' || algorithm === 'MFU') {
        freqTrack.set(page, (freqTrack.get(page) || 0) + 1);
      }
    } else {
      faults++;
      const emptyIdx = frames.indexOf(null);
      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
        reason = `Initial load into empty frame ${emptyIdx}.`;
        if (algorithm === 'FIFO') fifoQueue.push(page);
      } else {
        let replaceIdx = -1;
        if (algorithm === 'FIFO') {
          const victim = fifoQueue.shift()!;
          replaceIdx = frames.indexOf(victim);
          replacedPage = victim;
          reason = 'First-In-First-Out: Oldest page in memory replaced.';
          fifoQueue.push(page);
        } else if (algorithm === 'LRU') {
          let oldestAccess = Infinity;
          let victim = '';
          frames.forEach((f) => {
            const lastAccess = lruTrack.get(f!) || 0;
            if (lastAccess < oldestAccess) {
              oldestAccess = lastAccess;
              victim = f!;
            }
          });
          replaceIdx = frames.indexOf(victim);
          replacedPage = victim;
          reason = 'Least Recently Used: Page not accessed for the longest time replaced.';
        } else if (algorithm === 'LFU') {
          let minFreq = Infinity;
          let victim = '';
          frames.forEach((f) => {
            const freq = freqTrack.get(f!) || 0;
            if (freq < minFreq) {
              minFreq = freq;
              victim = f!;
            }
          });
          replaceIdx = frames.indexOf(victim);
          replacedPage = victim;
          reason = 'Least Frequently Used: Page with the lowest access count replaced.';
        } else if (algorithm === 'MFU') {
          let maxFreq = -Infinity;
          let victim = '';
          frames.forEach((f) => {
            const freq = freqTrack.get(f!) || 0;
            if (freq > maxFreq) {
              maxFreq = freq;
              victim = f!;
            }
          });
          replaceIdx = frames.indexOf(victim);
          replacedPage = victim;
          reason = 'Most Frequently Used: Page with the highest access count replaced.';
        }
        frames[replaceIdx] = page;
      }
      
      // Update tracking after fault
      if (algorithm === 'LRU') lruTrack.set(page, index);
      if (algorithm === 'LFU' || algorithm === 'MFU') {
        freqTrack.set(page, (freqTrack.get(page) || 0) + 1);
      }
    }

    steps.push({
      index,
      page,
      isHit,
      frames: [...frames],
      replacedPage,
      reason
    });
  });

  const hitRatio = referenceString.length > 0 ? hits / referenceString.length : 0;
  const faultPercentage = referenceString.length > 0 ? (faults / referenceString.length) * 100 : 0;
  const efficiencyScore = Math.max(0, 100 - (faultPercentage / 2));

  return {
    steps,
    faults,
    hits,
    hitRatio,
    faultPercentage,
    efficiencyScore
  };
}

export function runBeladyAnomaly(algorithm: AlgorithmType, referenceString: string[]): { frames: number; faults: number }[] {
  const results = [];
  for (let f = 1; f <= 10; f++) {
    const res = simulate(algorithm, referenceString, f);
    results.push({ frames: f, faults: res.faults });
  }
  return results;
}