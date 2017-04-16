const COLORS = ['blue', 'red', 'green', 'yellow'];

const GAME_LOST = 'GAME_LOST';
const GAME_WON = 'GAME_WON';
const CONTINUE_GAME = 'CONTINUE_GAME';
const MATCH = 'MATCH';
const NO_MATCH = 'NO_MATCH';
const ROUND_LOST = 'ROUND_LOST';
const ROUND_WON = 'ROUND_WON';
const CONTINUE_ROUND = 'CONTINUE_ROUND';
const STRICT = 'STRICT';
const NORMAL = 'NORMAL';

class Simon {
  constructor(config) {
    this.mode = config.mode;
    this.playerInput = config.playerInputCb;
    this.gameOver = config.gameOverCb;
    this.roundWon = config.roundWonCb;
    this.roundLost = config.roundLostCb;
    this.continueRound = config.continueRoundCb;
    this.playSound = config.playSoundCb;
    this._count = 0;
    this._status = CONTINUE_GAME;
    this._matches = 0;
    this._pattern = [Simon.getColor()];
  }

  static getColor() {
    const random = Math.floor(Math.random() * 4);

    return COLORS[random];
  }

  incrementCount() {
    this._count++;
  }

  count() {
    return this._count;
  }

  resetMatches() {
    this._matches = 0;
  }

  incrementMatches() {
    this._matches++;
  }

  matches() {
    return this._matches;
  }

  getStatus(status) {
    return this._status;
  }

  patternColor() {
    return this._pattern[this._matches];
  }

  addColorToPattern() {
    this._pattern.push(Simon.getColor());
  }

  pattern() {
    return this._pattern.slice();
  }

  static colorMatch(color1, color2) {
    return color1 === color2;
  }

  checkForMatch(color) {

    const match = Simon.colorMatch(color, this.patternColor());

    if (!match) {
      return NO_MATCH;
    }
    return MATCH;
  }

  updateStatus(playerInput) {
    const match = this.checkForMatch(playerInput);

    if (match === MATCH) {

      if (this.matches() === this.count() && this.count() < 20) {
        this._status = ROUND_WON;
      } else {
        this._status = CONTINUE_ROUND;
      }

      if (this.count() === 20) {
        this._status = (GAME_WON);
      }
    } else {
      if (this.mode === STRICT) {
        this._status = GAME_LOST;
      } else {
        this._status = ROUND_LOST;
      }
    }
  }

  turn() {

    this.updateStatus(this.playerInput());
    console.log(this._status, this.playerInput(), this.patternColor());

    switch (this._status){
      case ROUND_WON:
        this.incrementCount();
        this.resetMatches();
        this.addColorToPattern();
        this.roundWon();
        return;
      case ROUND_LOST:
        this.resetMatches();
        this.roundLost();
        return;
      case CONTINUE_ROUND:
        this.incrementMatches();
        this.continueRound();
        return;
      default:
        this.gameOver();
        return;
    }
  }
  gameOver() {
    this.gameOver();
  }
}

if (typeof module !== 'undefined') {
  module.exports = {
    Simon,
    COLORS,
    GAME_LOST,
    GAME_WON,
    CONTINUE_GAME,
    MATCH,
    NO_MATCH,
    ROUND_LOST,
    ROUND_WON,
    CONTINUE_ROUND,
    STRICT,
    NORMAL
  };
}

