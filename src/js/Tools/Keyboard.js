import Emitter from './EventEmitter'

export default class Keyboard extends Emitter {
	constructor() {
		super()

		document.addEventListener('keydown', this.getKey.bind(this))
	}

	getKey(e) {
		const key = (e.key != ' ' ? e.key : e.code).toUpperCase()

		this.trigger('key', [key])
	}

	destroy() {
		this.off('key')
		document.removeEventListener('keydown', this.getKey.bind(this))
	}
}
