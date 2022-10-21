import Axis from 'axis-api'

import Emitter from '../Tools/EventEmitter'
import { store } from '../Tools/Store'

class LivesManager {
	constructor() {
		this.lives = 2
		this.lifeEvent = new Emitter()
		this.setLeaderBoard()

		this.lifeEvent.on('looseLife', this.handleLooseLife)
	}

	setLeaderBoard() {
		this.leaderboard = Axis.createLeaderboard({
			id: 'BOOP-497a99f9-bf2a-4b21-8b58-52492c18b46d',
		})
	}

	removeLife() {
		this.lives--
		this.lifeEvent.trigger('looseLife', [this.lives])
	}

	loose() {
		this.lives = 0
		this.lifeEvent.trigger('looseLife', [this.lives])
	}

	handleLooseLife = (lives) => {
		console.log('looseLife', lives)
		if (lives === 0) this.endGame()
	}

	endGame() {
		store.hasLost = true
		const endScreen = document.getElementById('end')
		endScreen.style.display = 'block'

		const input = document.querySelector('input')

		Axis.virtualKeyboard.open()
		store.virtualKeyboardOpen = true

		Axis.virtualKeyboard.addEventListener('input', (username) => {
			input.value = username
			input.innerHTML = username
		})

		Axis.virtualKeyboard.addEventListener('validate', () => {
			Axis.virtualKeyboard.close()
			store.virtualKeyboardOpen = false
			this.leaderboard
				.postScore({
					username: input.value,
					value: Date.now() - store.startTime,
				})
				.then(() => {
					// Get all scores
					this.leaderboard.getScores().then((response) => {
						store.canRestart = true
						for (let i = 0; i < 4; i++) {
							const resp = response[i]
							const time = new Date(resp.value)

							const div = document.getElementById('leaderboard')

							const wrapper = document.createElement('div')

							const value = document.createElement('h2')
							value.innerHTML =
								resp.username +
								' - ' +
								`${time
									.getMinutes()
									.toString()
									.padStart(2, '0')}:${time
									.getSeconds()
									.toString()
									.padStart(2, '0')}:${time
									.getMilliseconds()
									.toString()
									.padStart(3, '0')}`

							wrapper.appendChild(value)

							div.appendChild(wrapper)
						}
					})
				})
		})
	}
}

export default new LivesManager()
