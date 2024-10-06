//% color="#ffb236" icon="\uf0ac" block="Map Generator"
namespace mapGen {

  function getTileIndex(tilemap: tiles.TileMapData, image: Image): number {
    const tileset = tilemap.getTileset()
    const index = tileset.indexOf(image)
    if (index !== undefined) return index
    if (tileset.length >= 0xff) return 0
    tileset.push(image)
    return tileset.length - 1
  }

  function getTileIndices(tilemap: tiles.TileMapData, imageList: Image[]): number[] {
    return imageList.map(image => getTileIndex(tilemap, image))
  }

  //% block="generate height map terrain with tiles $tiles at size $size || on tilemap $tilemap"
  //% tiles.shadow="lists_create_with" tiles.defl="tileset_tile_picker"
  //% size.defl=10
  //% tilemap.shadow=variables_get
  //% tilemap.defl=tilemap
  export function generateHeightMapTerrain(tiles: Image[], size: number = 10, tilemap: tiles.TileMapData = null) {
    if (tilemap == null) {
      if (!game.currentScene().tileMap) return
      tilemap = game.currentScene().tileMap.data
    }

    const noise = new mapGen.SimplexNoise()
    const tileIndices = getTileIndices(tilemap, tiles)
    const heightStep = 1.0 / tiles.length

    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        const height = noise.getValue(x / size, y / size)
        for (let index = 0; index < tiles.length; index++) {
          if (height < (index + 1) * heightStep) {
            tilemap.setTile(x, y, tileIndices[index])
            break
          }
        }
      }
    }
  }

  //% block="generate tile blobs with $blobTile covering $coverTile at size $size coverage percent $coverage || on tilemap $tilemap"
  //% blobTile.shadow=tileset_tile_picker
  //% coverTile.shadow=tileset_tile_picker
  //% size.defl=10
  //% coverage.defl=50
  //% tilemap.shadow=variables_get
  //% tilemap.defl=tilemap
  export function generateTileBlobs(blobTile: Image, coverTile: Image, size: number = 10, coverage: number = 50, tilemap: tiles.TileMapData = null) {
    if (tilemap == null) {
      if (!game.currentScene().tileMap) return
      tilemap = game.currentScene().tileMap.data
    }

    const noise = new mapGen.SimplexNoise()
    const blobTileIndex = getTileIndex(tilemap, blobTile)
    const coverTileIndex = getTileIndex(tilemap, coverTile)

    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        if (tilemap.getTile(x, y) == coverTileIndex) {
          if (noise.getValue(x / size, y / size) * 100 <= coverage) {
            tilemap.setTile(x, y, blobTileIndex)
          }            
        }
      }
    }
  }
}