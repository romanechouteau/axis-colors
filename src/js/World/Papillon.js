import { Object3D } from 'three'

export default class Papillon {
	constructor(options) {
		this.assets = options.assets

		this.container = new Object3D()
		this.init()
	}

	init() {
		this.papillon = this.assets.models.papillon.scene
		this.container.add(this.papillon)
	}
}
