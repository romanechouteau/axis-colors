import Emitter from '../Tools/EventEmitter'

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
    console.log('tas perdu #endgame #avengers')
  }
}

export default new LivesManager()
