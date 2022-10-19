import { Object3D, Vector3 } from 'three'

import Block, {
	BLOCK_DIMENSIONS,
	BLOCK_TYPE,
	BLOCK_TYPE_LIST,
	BLOCK_WIDTH,
} from './Block'

export default class BlockManager {
	constructor(options) {
		this.time = options.time
		this.assets = options.assets
		this.totalWidth = options.totalWidth
		this.totalHeight = options.totalHeight
		this.physicsWorld = options.physicsWorld
		this.worldPosition = options.worldPosition
		this.playerManager = options.playerManager

		this.container = new Object3D()
		this.currentX = 0
		this.blocks = []

		this.init()
	}

	init() {
		this.initBlocks()

		this.time.on('tick', this.render)
	}

	initBlocks() {
		this.currentX = -this.totalWidth
		this.generateBlocks()
	}

	generateType(first) {
		// return BLOCK_TYPE.tunnel
		if (first) return BLOCK_TYPE.normal

		const val = Math.random()
		const prevType =
			this.blocks.length === 0
				? undefined
				: this.blocks[this.blocks.length - 1].type

		const possibleTypes = BLOCK_TYPE_LIST.filter(
			(key) => BLOCK_TYPE[key] !== prevType
		)
		const probability = 1 / possibleTypes.length

		for (let i = 0; i < possibleTypes.length; i++) {
			if (val < probability * (i + 1)) {
				return BLOCK_TYPE[possibleTypes[i]]
			}
		}
	}

	generateBlocks() {
		const maxX = this.totalWidth * 2

		while (this.worldPosition.x + this.currentX <= maxX) {
			const type = this.generateType(this.currentX <= BLOCK_WIDTH * 2)

			const block = new Block({
				type,
				time: this.time,
				assets: this.assets,
				position: new Vector3(this.currentX, 0, 0),
				physicsWorld: this.physicsWorld,
				playerManager: this.playerManager
			})

			this.container.add(block.container)

			this.currentX += BLOCK_DIMENSIONS[type] * BLOCK_WIDTH
			this.blocks.push(block)
		}
	}

	destroyBlocks() {
		let x = this.blocks[0].container.position.x
		while (this.worldPosition.x + x < -this.totalWidth) {
			const toRemove = this.blocks.shift()
			toRemove.destroy()
			x = this.blocks[0].container.position.x
		}
	}

	render = () => {
		if (this.worldPosition.x + this.currentX >= this.totalWidth * 2) return

		this.generateBlocks()
		this.destroyBlocks()
	}

	collisionEvents(handle1, handle2, started) {
		this.blocks.forEach(block => block.collisionEvents(handle1, handle2, started))
	}
}
