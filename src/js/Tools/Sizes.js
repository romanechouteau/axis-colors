// Steal from https://github.com/brunosimon/folio-2019
import Emitter from './EventEmitter'
import { store } from './Store'

export default class Sizes extends Emitter {
	constructor() {
		// Get parent methods
		super()

		// Resize event
		this.resize = this.resize.bind(this)
		window.addEventListener('resize', this.resize)
		this.resize()
	}
	// on('resize')
	resize() {
		store.resolution.width = window.innerWidth
		store.resolution.height = window.innerHeight
		store.resolution.dpr = window.devicePixelRatio
		store.aspect.ratio = store.resolution.width / store.resolution.height

		this.trigger('resize')
	}
}
