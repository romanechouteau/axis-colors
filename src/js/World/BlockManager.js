import { Object3D, Vector3 } from 'three'

import { store } from '../tools/Store'
import Block, { BLOCK_DIMENSIONS, BLOCK_TYPE, BLOCK_TYPE_LIST, BLOCK_WIDTH } from './Block'

export default class BlockManager {
	constructor(options) {
    this.camera = options.camera

    this.container = new Object3D()
    this.currentX = 0
    this.blocks = []

    this.init()
	}

  init() {
    this.setSize()

    this.initBlocks()
  }

  setSize() {
    const cameraZ = this.camera.camera.position.z
    const aspect = store.resolution.width / store.resolution.height
    const vFov = this.camera.camera.fov * Math.PI / 180

    this.totalHeight = 2 * Math.tan(vFov / 2) * cameraZ
    this.totalWidth = this.totalHeight * aspect
  }

  initBlocks() {
    this.currentX = - this.totalWidth * 0.75
    const maxX = this.totalWidth * 0.75 + BLOCK_WIDTH

    while (this.currentX <= maxX) {
      const type = this.generateType(this.blocks.length === 0)
      const x = this.currentX

      const block = new Block({
        type,
        position: new Vector3(x, 0, 0)
      })

      this.container.add(block.container)

      this.currentX = x + BLOCK_DIMENSIONS[type] * BLOCK_WIDTH
      this.blocks.push(block)
    }
  }

  generateType(first) {
    if (first) return BLOCK_TYPE.normal

    const val = Math.random()
    const prevType = this.blocks.length === 0 ? undefined : this.blocks[this.blocks.length - 1].type

    const possibleTypes = BLOCK_TYPE_LIST.filter(key => BLOCK_TYPE[key] !== prevType)
    const probability = 1 / possibleTypes.length

    for (let i = 0; i < possibleTypes.length; i++) {
      if (val < probability * (i + 1)) {
        return BLOCK_TYPE[possibleTypes[i]]
      }
    }
  }
}
