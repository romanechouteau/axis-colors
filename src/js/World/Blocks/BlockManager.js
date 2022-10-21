import {
	Object3D,
	Vector3,
	MeshStandardMaterial,
	MeshMatcapMaterial,
} from 'three'

import Block, {
	BLOCK_DIMENSIONS,
	BLOCK_PROBABILITY,
	BLOCK_TYPE,
	BLOCK_TYPE_LIST,
	BLOCK_WIDTH,
} from './Block'

// COLORS
const TUNNEL_COLORS = {
	1: 0xa4c9e7,
	2: 0xe79ebe,
}
const BUTTON_COLOR = 0xac78ff
const PLATFORM_COLORS = {
	0: 0xac78ff,
	1: 0x5deff,
	2: 0xffafd2,
}

export default class BlockManager {
	constructor(options) {
		this.time = options.time
		this.assets = options.assets
		this.listener = options.listener
		this.totalWidth = options.totalWidth
		this.totalHeight = options.totalHeight
		this.physicsWorld = options.physicsWorld
		this.dangerManager = options.dangerManager
		this.worldPosition = options.worldPosition
		this.playerManager = options.playerManager
		this.hdr = options.hdr

		this.container = new Object3D()
		this.currentX = 0
		this.blocks = []
		this.nextGenerate = 0

		this.init()
	}

	// INITIALIZERS

	init() {
		this.initMaterials()
		this.initBlocks()

		this.time.on('tick', this.render)
	}

	initBlocks() {
		this.currentX = -this.totalWidth
		this.generateBlocks()
	}

	initMaterials() {
		this.floorMaterial = new MeshStandardMaterial({
			color: 0xe79fad,
			emissive: 0x000000,
			envMap: this.hdr,
			envMapIntensity: 1,
			metalness: 1,
			roughness: 0.3,
		})

		this.buttonMaterial = new MeshMatcapMaterial({
			matcap: this.assets.textures.gold,
		})
		this.buttonMaterialInside = new MeshStandardMaterial({
			color: BUTTON_COLOR,
			emissive: 0x000000,
			metalness: 1,
			roughness: 0,
			envMap: this.hdr,
		})

		this.tunnelMaterials = []
		this.platformMaterials = []

		for (let i = 0; i <= 2; i++) {
			const platformMaterial = new MeshStandardMaterial({
				color: PLATFORM_COLORS[i],
				emissive: 0x000000,
				metalness: 1,
				roughness: 0,
				envMap: this.hdr,
			})
			this.platformMaterials[i] = platformMaterial

			if (i === 0) continue
			const tunnelMaterial = new MeshStandardMaterial({
				color: TUNNEL_COLORS[i],
				metalness: 1,
				roughness: 0,
				envMap: this.hdr,
				transparent: true,
				opacity: 0.7,
			})
			this.tunnelMaterials[i] = tunnelMaterial
		}

		this.materials = {
			floorMaterial: this.floorMaterial,
			buttonMaterial: this.buttonMaterial,
			buttonMaterialInside: this.buttonMaterialInside,
			tunnelMaterials: this.tunnelMaterials,
			platformMaterials: this.platformMaterials,
		}
	}

	// GENERATORS

	generateType(first) {
		if (first) return BLOCK_TYPE.normal

		const val = Math.random()
		const prevType =
			this.blocks.length === 0
				? undefined
				: this.blocks[this.blocks.length - 1].type

		const possibleTypes = BLOCK_TYPE_LIST.filter(
			(key) =>
				(BLOCK_TYPE[key] !== prevType ||
					BLOCK_TYPE[key] === BLOCK_TYPE.normal) &&
				!(
					prevType === BLOCK_TYPE.empty &&
					BLOCK_TYPE[key] === BLOCK_TYPE.empty_plateform
				) &&
				!(
					prevType === BLOCK_TYPE.empty_plateform &&
					BLOCK_TYPE[key] === BLOCK_TYPE.empty
				) &&
				!(
					prevType === BLOCK_TYPE.empty &&
					BLOCK_TYPE[key] === BLOCK_TYPE.platform
				) &&
				!(
					prevType === BLOCK_TYPE.platform &&
					BLOCK_TYPE[key] === BLOCK_TYPE.empty
				)
		)

		const totalProbability = possibleTypes.reduce(
			(acc, type) => acc + BLOCK_PROBABILITY[BLOCK_TYPE[type]],
			0
		)
		let currentProbability = 0

		for (let i = 0; i < possibleTypes.length; i++) {
			const type = BLOCK_TYPE[possibleTypes[i]]
			const probability = BLOCK_PROBABILITY[type] / totalProbability
			currentProbability += probability

			if (val < currentProbability) {
				return BLOCK_TYPE[possibleTypes[i]]
			}
		}
	}

	generateBlocks() {
		const maxX = this.totalWidth * 2
		this.nextGenerate = this.currentX - this.totalWidth

		while (this.worldPosition.x + this.currentX <= maxX) {
			const type = this.generateType(this.currentX <= BLOCK_WIDTH * 2)

			const block = new Block({
				type,
				time: this.time,
				assets: this.assets,
				listener: this.listener,
				position: new Vector3(this.currentX, 0, 0),
				physicsWorld: this.physicsWorld,
				playerManager: this.playerManager,
				dangerManager: this.dangerManager,
				materials: this.materials,
			})

			this.container.add(block.container)

			this.currentX += BLOCK_DIMENSIONS[type] * BLOCK_WIDTH
			this.blocks.push(block)
		}
	}

	// DESTROY

	destroyBlocks() {
		let x = this.blocks[0].position.x + this.blocks[0].width
		const maxX = Math.min(
			-this.totalWidth,
			this.dangerManager.x + this.worldPosition.x
		)
		while (this.worldPosition.x + x < maxX) {
			const toRemove = this.blocks.shift()
			toRemove.destroy()
			x = this.blocks[0].position.x + this.blocks[0].width
		}
	}

	// RENDER

	render = () => {
		this.destroyBlocks()

		if (-this.worldPosition.x < this.nextGenerate) return
		this.generateBlocks()
	}
}
