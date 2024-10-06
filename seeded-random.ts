namespace seededRandom {
  let seed = randint(0, 0xffffffff)

  export function reset(newSeed: number): void {
    seed = newSeed
  }

  const a = 1664525
  const c = 1013904223
  const m = Math.pow(2, 32)

  export function next(): number {
    seed = (a * seed + c) % m
    return seed / m
  }
}