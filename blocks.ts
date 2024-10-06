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

  //% block="generate height terrain with $tiles at size $size over $cover as island $island || on tilemap $tilemap"
  //% tiles.shadow="lists_create_with" tiles.defl="tileset_tile_picker"
  //% size.defl=10
  //% cover.shadow="tileset_tile_picker"
  //% tilemap.shadow="variables_get"
  //% tilemap.defl="tilemap"
  export function generateHeightTerrain(tiles: Image[], size: number = 10, cover: Image = null, island: boolean = false, tilemap: tiles.TileMapData = null) {
    if (tilemap == null) {
      if (!game.currentScene().tileMap) return
      tilemap = game.currentScene().tileMap.data
    }

    const coverTileIndex = cover ? getTileIndex(tilemap, cover) : 0
    const noise = new mapGen.SimplexNoise()
    const tileIndices = getTileIndices(tilemap, tiles)
    const heightStep = 1.0 / tiles.length

    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        if (tilemap.getTile(x, y) == coverTileIndex) {
          const height = noise.getValue(x / size, y / size)
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
  }
}