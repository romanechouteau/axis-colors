import { Object3D, PointLight } from 'three'

export default class PointLightSource {
	constructor(options) {
		// Set options
		if (options) {
			this.debug = options.debug
		}

		// Set up
		this.container = new Object3D()
		this.container.name = 'Point Light'
		this.params = {
			color: 0xffffff,
			positionX: 0,
			positionY: 2,
			positionZ: 5,
		}

		this.createPointLight()

		if (this.debug) {
			this.setDebug()
		}
	}
	createPointLight() {
		this.light = new PointLight(this.params.color, 2, 100)
		this.light.position.set(
			this.params.positionX,
			this.params.positionY,
			this.params.positionZ
		)
		this.container.add(this.light)
	}
	setDebug() {}
}
