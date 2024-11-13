//% color="#ffb236" icon="\uf0ac" block="Map Generator"
namespace mapGen {

  function getTileIndex(tilemap: tiles.TileMapData, image: Image): number {
    const tileset = tilemap.getTileset()
    const index = tileset.indexOf(image)
    if (index >= 0) return index
    if (tileset.length >= 0xff) return 0
    tileset.push(image)
    return tileset.length - 1
  }

  function getTileIndices(tilemap: tiles.TileMapData, imageList: Image[]): number[] {
    return imageList.map(image => getTileIndex(tilemap, image))
  }

  function getGradient(x: number, y: number, width: number, height: number): number {
    const dx = Math.abs(x - width / 2) / (width / 2)
    const dy = Math.abs(y - height / 2) / (height / 2)
    return (1 - dx * dx) * (1 - dy * dy)
  }

  //% block="set generator seed to $newSeed"
  //% newSeed.defl=0
  export function resetSeed(newSeed: number = 0): void {
    seededRandom.reset(newSeed)
  }

  //% block="generate terrain with $tiles at scale $scale as island $island|| between left $left top $top right $right bottom $bottom"
  //% expandableArgumentMode="toggle"
  //% tiles.shadow="lists_create_with" tiles.defl="tileset_tile_picker"
  //% scale.defl=10
  //% top.defl=0 bottom.defl=255 left.defl=0 right.defl=255
  export function generateTerrain(
    tiles: Image[],
    scale: number = 10,
    island: boolean = false,
    top: number = 0,
    bottom: number = 255,
    left: number = 0,
    right: number = 255
  ) {
    if (!game.currentScene().tileMap) return

    const tilemap = game.currentScene().tileMap.data
    top = Math.max(0, top)
    bottom = Math.min(tilemap.height - 1, bottom)
    left = Math.max(0, left)
    right = Math.min(tilemap.width - 1, right)

    if(top > bottom || left > right) return

    const noise = new mapGen.SimplexNoise()
    const tileIndices = getTileIndices(tilemap, tiles)
    const heightStep = 1.0 / tiles.length

    const mapWidth = right - left + 1
    const mapHeight = bottom - top + 1

    for (let x = left; x <= right; x++) {
      for (let y = top; y <= bottom; y++) {
        if(tilemap.isWall(x, y)) continue
        const height = noise.getValue(x / scale, y / scale)
          * (island ? getGradient(x - left, y - top, mapWidth, mapHeight) : 1)
        for (let index = 0; index < tiles.length; index++) {
          if (height < (index + 1) * heightStep) {
            if (tileIndices[index] > 0) {
              tilemap.setTile(x, y, tileIndices[index])
            }
            break
          }
        }
      }
    }
  }

  //% block="generate landscape with $layers at scale $scale from y $groundY || rise $mountainHeight fall $valleyDepth underground layer thickness $layerDepth"
  //% layers.shadow="lists_create_with" layers.defl="tileset_tile_picker"
  //% scale.defl=10
  //% groundY.defl=12
  //% mountainHeight.defl=6
  //% valleyDepth.defl=4
  //% layerDepth.defl=8
  export function generateLandscape(
    layers: Image[],
    scale: number = 10,
    groundY: number = 12,
    mountainHeight: number = 6,
    valleyDepth: number = 4,
    layerDepth: number = 8,
  ) {
    if (!game.currentScene().tileMap) return

    const tilemap = game.currentScene().tileMap.data
    const noise = new mapGen.SimplexNoise()
    const layerIndices = getTileIndices(tilemap, layers)

    for (let x = 0; x < tilemap.width; x++) {

      const noiseValue = (noise.getValue(x / scale, 0) - 0.5) * 2
      let depth = groundY + noiseValue * (noiseValue < 0 ? mountainHeight : valleyDepth)
      let prev = Math.max(0, depth)

      for (let layer = 0; layer < layers.length; layer++) {
        prev = Math.max(0, depth)
        depth = Math.max(0, depth
          + layerDepth
          + (noise.getValue(x / scale, (layer + 1) * layerDepth / scale) - 0.5) * layerDepth / 2)

        for (let y = prev; y < depth && y < tilemap.height; y++) {
          if (tilemap.isWall(x, y)) continue
          tilemap.setTile(x, y, layerIndices[layer])
        }
      }

      for (let y = prev; y < tilemap.height; y++) {
        if (tilemap.isWall(x, y)) continue
        tilemap.setTile(x, y, layerIndices[layerIndices.length - 1])
      }
    }
  }
}

namespace Math {
  //% group="Seeded Random"
  //% block="reset to seed $newSeed"
  export function resetSeed(newSeed: number): void {
    seededRandom.reset(newSeed)
  }

  //% group="Seeded Random"
  //% block="pick seeded random $min to $max"
  export function getSeededRandInt(min: number, max: number): number {
    return Math.floor(seededRandom.next() * (max + 1 - min) + min)
  }
}