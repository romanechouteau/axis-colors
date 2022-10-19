import { Object3D, AmbientLight } from 'three'

export default class AmbientLightSource {
	constructor(options) {
		// Set options
		if (options) {
			this.debug = options.debug
		}

		// Set up
		this.container = new Object3D()
		this.container.name = 'Ambient Light'
		this.params = { color: 0xffffff }

		this.createAmbientLight()

		if (this.debug) {
			this.setDebug()
		}
	}
	createAmbientLight() {
		this.light = new AmbientLight(this.params.color, 1)
		this.container.add(this.light)
	}
	setDebug() {}
}
