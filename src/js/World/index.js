import {
	AxesHelper,
	Object3D,
	BoxGeometry,
	MeshBasicMaterial,
	Mesh,
} from 'three'

import AmbientLightSource from './lights/AmbientLight'
import PointLightSource from './lights/PointLight'
import Papillon from './Papillon'

export default class World {
	constructor(options) {
		// Set options
		this.time = options.time
		this.debug = options.debug
		this.assets = options.assets

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
		// this.setCube()
		this.setPapillon()
	}
	setLoader() {
		this.assets.on('ressourcesReady', () => {
			this.init()
		})
	}
	setAmbientLight() {
		this.ambientlight = new AmbientLightSource()
		this.container.add(this.ambientlight.container)
	}
	setPointLight() {
		this.light = new PointLightSource()
		this.container.add(this.light.container)
	}
	setPapillon() {
		this.papillon = new Papillon({ assets: this.assets })
		this.container.add(this.papillon.container)
	}
	setCube() {
		const geometry = new BoxGeometry(1, 1, 1)
		const material = new MeshBasicMaterial({ color: 0x00ff00 })
		const cube = new Mesh(geometry, material)
		this.container.add(cube)
	}
}
