import { Object3D, PerspectiveCamera, Vector3 } from 'three'

import { store } from './Tools/Store'

export default class Camera {
	constructor(options) {
		// Set Options
		this.sizes = options.sizes
		this.renderer = options.renderer
		this.debug = options.debug

		// Set up
		this.container = new Object3D()
		this.container.name = 'Camera'

		this.setCamera()
		this.setPosition()
		this.setLookAt()

		if (this.debug) {
			this.setDebug()
		}
	}
	setCamera() {
		// Create camera
		this.camera = new PerspectiveCamera(
			50,
			store.resolution.width / store.resolution.height,
			0.1,
			1000
		)
		this.container.add(this.camera)
		// Change camera aspect on resize
		this.sizes.on('resize', () => {
			this.camera.aspect =
				store.resolution.width / store.resolution.height
			// Call this method because of the above change
			this.camera.updateProjectionMatrix()
		})
	}
	setPosition() {
		// Set camera position
		this.camera.position.x = 0
		this.camera.position.y = 4
		this.camera.position.z = 5
	}
	setLookAt() {
		this.lookat = new Vector3(0, 0, -2)
		this.camera.lookAt(this.lookat)
	}
	setDebug() {}
}
