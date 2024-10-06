//% color="#ffb236" icon="\uf0ac" block="Map Generator"
namespace mapGen {

  function getTileset(tilemap: tiles.TileMapData, imageList: Image[]): number[] {
    const tileset = tilemap.getTileset()    
    return imageList.map(image => {
      const index = tileset.indexOf(image)
      if (index === undefined) {
        const newIndex = tileset.length
        if (newIndex < 256) {
          tileset.push(image)
          return newIndex
        } else {
          return 0
        }
      } else {
        return index
      }
    })
  }

  //% block="generate height map terrain with tiles $tiles at scale $scale || on tilemap $tilemap"
  //% tiles.shadow="lists_create_with" tiles.defl="tileset_tile_picker"
  //% scale.defl=10
  //% tilemap.shadow=variables_get
  //% tilemap.defl=tilemap
  export function generateHeightMapTerrain(tiles: Image[], scale: number = 10, tilemap: tiles.TileMapData = null) {
    if (tilemap == null) {
      if (!game.currentScene().tileMap) return
      tilemap = game.currentScene().tileMap.data
    }

    const noise = new mapGen.SimplexNoise()
    const tileset = getTileset(tilemap, tiles)
    const heightStep = 1.0 / tiles.length

    for (let x = 0; x < tilemap.width; x++) {
      for (let y = 0; y < tilemap.height; y++) {
        const height = (noise.getValue(x / scale, y / scale) + 1.0) * 0.5
        for (let tile = 0; tile < tiles.length; tile++) {
          if (height < (tile + 1) * heightStep) {
            tilemap.setTile(x, y, tileset[tile])
            break
          }
        }
      }
    }
  }
}