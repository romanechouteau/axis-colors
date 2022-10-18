import EventEmitter from './EventEmitter'

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'

import { AudioLoader, TextureLoader } from 'three'

export default class Loader extends EventEmitter {
	constructor(options) {
		// Get parent methods
		super()
		this.template = options.template

		// Set up
		this.ressourcesList = []
		this.total = 0
		this.done = 0
		this.currentPercent = 0
		this.models = {}
		this.textures = {}
		this.sounds = {}
		this.fonts = {}

		this.setLoaders()
		this.setRessourcesList()
	}
	setLoaders() {
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath('./draco/')
		dracoLoader.setDecoderConfig({ type: 'js' })

		const gltfLoader = new GLTFLoader()
		gltfLoader.setDRACOLoader(dracoLoader)

		const fbxLoader = new FBXLoader()

		const textureLoader = new TextureLoader()
		const fontLoader = new FontLoader()
		const soundLoader = new AudioLoader()

		this.loaders = [
			{
				filetype: ['gltf', 'glb'],
				action: (model) => {
					gltfLoader.load(
						model.src,
						(loaded) => {
							this.loadComplete(model, loaded)
						},
						(xhr) => {
							this.progress(xhr)
						}
					)
				},
			},
			{
				filetype: ['fbx'],
				action: (model) => {
					fbxLoader.load(
						model.src,
						(loaded) => {
							this.loadComplete(model, loaded)
						},
						(xhr) => {
							this.progress(xhr)
						}
					)
				},
			},
			{
				filetype: ['png', 'jpg', 'jpeg'],
				action: (texture) => {
					textureLoader.load(
						texture.src,
						(loaded) => {
							this.loadComplete(texture, loaded)
						},
						(xhr) => {
							this.progress(xhr)
						}
					)
				},
			},
			{
				filetype: ['json'],
				action: (font) => {
					fontLoader.load(
						font.src,
						(loaded) => {
							this.loadComplete(font, loaded)
						},
						(xhr) => {
							this.progress(xhr)
						}
					)
				},
			},
			{
				filetype: ['mp3', 'ogg', 'wav'],
				action: (sound) => {
					soundLoader.load(
						sound.src,
						(loaded) => {
							this.loadComplete(sound, loaded)
						},
						(xhr) => {
							this.progress(xhr)
						}
					)
				},
			},
		]
	}
	progress(xhr) {
		if (xhr.lengthComputable) {
			this.currentPercent = Math.floor((xhr.loaded / xhr.total) * 100)
			if (this.currentPercent === 100) {
				this.currentPercent = 0
			}
			this.trigger('ressourceLoad')
		}
	}

	async setRessourcesList() {
		const modelsContext = import.meta.glob('../../models/*.gltf')
		for (const model in modelsContext) {
			await modelsContext[model]().then((mod) => {
				this.ressourcesList.push({
					name: model
						.split('/models/')[1]
						.split('.')[0]
						.toLowerCase(),
					src: window.location.origin + mod.default,
					type: 'model',
				})
			})
		}

		const texturesContext = import.meta.glob('../../textures/*.*')
		for (const texture in texturesContext) {
			await texturesContext[texture]().then((tex) => {
				this.ressourcesList.push({
					name: texture
						.split('/textures/')[1]
						.split('.')[0]
						.toLowerCase(),
					src: window.location.origin + tex.default,
					type: 'texture',
				})
			})
		}

		const fontsContext = import.meta.glob('../../fonts/*.json')
		for (const font in fontsContext) {
			await fontsContext[font]().then((tex) => {
				this.ressourcesList.push({
					name: font.split('/fonts/')[1].split('.')[0].toLowerCase(),
					src: window.location.origin + tex.default,
					type: 'font',
				})
			})
		}

		const soundsContext = import.meta.glob('../../sounds/*.wav')
		for (const sound in soundsContext) {
			await soundsContext[sound]().then((tex) => {
				this.ressourcesList.push({
					name: sound
						.split('/sounds/')[1]
						.split('.')[0]
						.toLowerCase(),
					src: window.location.origin + tex.default,
					type: 'sound',
				})
			})
		}

		if (this.ressourcesList.length > 0) {
			this.loadRessources(this.ressourcesList)
		} else {
			this.trigger('ressourcesReady')
		}
	}
	loadRessources(ressources) {
		ressources.forEach((ressource) => {
			this.total++
			const ressourceExtension =
				ressource.src.substring(
					ressource.src.lastIndexOf('.') + 1,
					ressource.src.length
				) || ressource.src
			if (ressourceExtension) {
				const loader = this.loaders.find(($loader) =>
					$loader.filetype.find(
						($filetype) => $filetype === ressourceExtension
					)
				)
				if (loader) {
					loader.action(ressource)
				} else {
					console.error(`No loader is set for ${ressourceExtension}`)
				}
			} else {
				console.error(`${ressource} is a valid ressource ?`)
			}
		})
	}
	loadComplete(ressource, loaded) {
		this.done++
		this.createNestedObject(
			this[`${ressource.type}s`],
			ressource.name.split('/'),
			loaded
		)

		this.trigger('ressourceLoad', [ressource, loaded])

		if (this.total === this.done) {
			setTimeout(() => {
				this.trigger('ressourcesReady')
			}, 1000)
		}
	}
	createNestedObject(base, names, value) {
		let lastName = arguments.length === 3 ? names.pop() : false
		for (let i = 0; i < names.length; i++) {
			base = base[names[i]] = base[names[i]] || {}
		}
		if (lastName) base = base[lastName] = value
		return base
	}
}
