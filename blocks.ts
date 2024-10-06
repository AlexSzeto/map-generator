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

  //% block="generate terrain with $tiles at scale $scale as island $island || on tilemap $tilemap"
  //% tiles.shadow="lists_create_with" tiles.defl="tileset_tile_picker"
  //% scale.defl=10
  //% tilemap.shadow="variables_get"
  //% tilemap.defl="tilemap"
  export function generateTerrain(tiles: Image[], scale: number = 10, island: boolean = false, tilemap: tiles.TileMapData = null) {
    if (tilemap == null) {
      if (!game.currentScene().tileMap) return
      tilemap = game.currentScene().tileMap.data
    }

    const noise = new mapGen.SimplexNoise()
    const tileIndices = getTileIndices(tilemap, tiles)
    const heightStep = 1.0 / tiles.length

    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        if(tilemap.isWall(x, y)) continue
        const height = noise.getValue(x / scale, y / scale)
          * (island ? getGradient(x, y, tilemap.width, tilemap.height) : 1)
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

  //% block="generate landscape at scale $scale from y $groundY rise height $mountainHeight fall depth $valleyDepth layer thickness $layerDepth || on tilemap $tilemap"
  //% tiles.shadow="lists_create_with" tiles.defl="tileset_tile_picker"
  //% scale.defl=10
  //% groundY.defl=10
  //% mountainHeight.defl=8
  //% valleyDepth.defl=4
  //% layerDepth.defl=12
  //% tilemap.shadow="variables_get"
  //% tilemap.defl="tilemap"
  export function generateLandscape(
    layers: Image[],
    scale: number = 10,
    groundY: 10,
    mountainHeight: number = 8,
    valleyDepth: number = 4,
    layerDepth: number = 12,
    tilemap: tiles.TileMapData = null
  ) {
    if (tilemap == null) {
      if (!game.currentScene().tileMap) return
      tilemap = game.currentScene().tileMap.data
    }

    const noise = new mapGen.SimplexNoise()
    const layerIndices = getTileIndices(tilemap, layers)

    for (let x = 0; x < tilemap.width; x++) {

      const noiseValue = noise.getValue(x / scale, 0) - 0.5
      let depth = groundY - valleyDepth
        + noiseValue * (noiseValue < 0 ? mountainHeight : valleyDepth)
      let prev: number

      for (let layer = 1; layer < layers.length; layer++) {
        prev = Math.max(0, depth)
        depth = Math.max(0, depth
          + layerDepth
          + (noise.getValue(x / scale, layer * layerDepth / scale) - 0.5) * layerDepth / 4)

        for (let y = prev; y < depth && y < tilemap.height; y++) {
          if (tilemap.isWall(x, y)) continue
          tilemap.setTile(x, y, layerIndices[layer - 1])
        }
      }

      for (let y = prev; y < tilemap.height; y++) {
        if (tilemap.isWall(x, y)) continue
        tilemap.setTile(x, y, layerIndices[layerIndices.length - 1])
      }
    }
  }
}