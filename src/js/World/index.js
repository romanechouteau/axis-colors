import {
	Object3D
} from 'three'

import BlockManager from './BlockManager'
import AmbientLightSource from './lights/AmbientLight'
import PointLightSource from './lights/PointLight'

export default class World {
	constructor(options) {
		// Set options
		this.time = options.time
		this.debug = options.debug
		this.assets = options.assets
		this.camera = options.camera

		// Set up
		this.container = new Object3D()
		this.container.name = 'World'

		if (this.debug) {
			this.debug.setFolder('Test')
		}

		this.setLoader()
	}
	init() {
		this.setAmbientLight()
		this.setPointLight()

		this.setBlockManager()
	}
	setLoader() {
		this.assets.on('ressourcesReady', () => {
			this.init()
		})
	}

	// LIGHTS
	setAmbientLight() {
		this.ambientlight = new AmbientLightSource()
		this.container.add(this.ambientlight.container)
	}
	setPointLight() {
		this.light = new PointLightSource()
		this.container.add(this.light.container)
	}

	// BLOCKS
	setBlockManager() {
		this.blockManager = new BlockManager({ camera: this.camera })
		this.container.add(this.blockManager.container)
	}
}
