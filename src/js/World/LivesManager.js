import Emitter from '../Tools/EventEmitter'
import { store } from '../Tools/Store'

class LivesManager {
	constructor() {
    this.lives = 2
    this.lifeEvent = new Emitter()

    this.lifeEvent.on('looseLife', this.handleLooseLife)
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
    document.getElementById('end').style.display = 'block'
  }
}

export default new LivesManager()
