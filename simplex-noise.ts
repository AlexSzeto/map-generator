namespace mapGen {
  
  const GRAD3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ]
  const F2 = 0.5 * (Math.sqrt(3) - 1)
  const G2 = (3 - Math.sqrt(3)) / 6

  export class SimplexNoise {

    private p: number[] = []
    private perm: number[] = []

    constructor() {
      for (let i = 0; i < 256; i++) {
        this.p.push(Math.floor(seededRandom.next() * 256))
      }

      // To remove the need for index wrapping, double the permutation table length
      for (let i = 0; i < 512; i++) {
        this.perm.push(this.p[i & 255])
      }
    }

    private dot(g: number[], x: number, y: number): number {
      return g[0] * x + g[1] * y
    }

    getValue(x: number, y: number) {
      
      let n0: number, n1: number, n2: number

      // Skew the input space to determine which simplex cell we're in
      const s = (x + y) * F2
      const i = Math.floor(x + s)
      const j = Math.floor(y + s)
      const t = (i + j) * G2

      // Unskew the cell origin back to (x,y) space
      const X0 = i - t
      const Y0 = j - t

      // The x and y distances from the cell origin
      const x0 = x - X0
      const y0 = y - Y0

      // Determine which simplex we're in
      let j1: number, i1: number
      if (x0 > y0) {
        i1 = 1
        j1 = 0
      } else {
        i1 = 0
        j1 = 1
      }

      const x1 = x0 - i1 + G2
      const y1 = y0 - j1 + G2
      const x2 = x0 - 1 + 2 * G2
      const y2 = y0 - 1 + 2 * G2

      const ii = i & 255
      const jj = j & 255
      const gi0 = this.perm[ii + this.perm[jj]] % 12
      const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12
      const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12

      // Calculate the contribution from the three corners
      let t0 = 0.5 - x0 * x0 - y0 * y0
      if (t0 < 0) n0 = 0
      else {
        t0 *= t0
        n0 = t0 * t0 * this.dot(GRAD3[gi0], x0, y0)
      }

      let t1 = 0.5 - x1 * x1 - y1 * y1
      if (t1 < 0) n1 = 0
      else {
        t1 *= t1
        n1 = t1 * t1 * this.dot(GRAD3[gi1], x1, y1)
      }

      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) n2 = 0
      else {
        t2 *= t2
        n2 = t2 * t2 * this.dot(GRAD3[gi2], x2, y2)
      }

      // Add contributions from each corner to get the final noise value
      return 70 * (n0 + n1 + n2)
    }
  }
}