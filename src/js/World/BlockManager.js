import { Object3D, Vector3 } from 'three'

import Block, { BLOCK_DIMENSIONS, BLOCK_TYPE, BLOCK_TYPE_LIST, BLOCK_WIDTH } from './Block'

export default class BlockManager {
	constructor(options) {
    this.totalWidth = options.totalWidth
    this.totalHeight = options.totalHeight
    this.physicsWorld = options.physicsWorld

    this.container = new Object3D()
    this.currentX = 0
    this.blocks = []

    this.init()
	}

  init() {
    this.initBlocks()
  }

  initBlocks() {
    this.currentX = - this.totalWidth * 0.8
    const maxX = this.totalWidth * 0.8 + BLOCK_WIDTH

    while (this.currentX <= maxX) {
      const type = this.generateType(this.currentX <= BLOCK_WIDTH * 2)

      const block = new Block({
        type,
        position: new Vector3(this.currentX, 0, 0),
        physicsWorld: this.physicsWorld
      })

      this.container.add(block.container)

      this.currentX += BLOCK_DIMENSIONS[type] * BLOCK_WIDTH
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
