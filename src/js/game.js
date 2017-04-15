const COLORS = ['BLUE', 'RED', 'GREEN', 'YELLOW'];

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
    this.playerInputCb = config.playerInputCb;
    this.gameOverCb = config.gameOverCb;
    this.roundWonCb = config.roundWonCb;
    this.roundLostCb = config.roundLostCb;
    this.continueRoundCb = config.continueRoundCb;
    this.playSound = config.playSound;
    this._count = 0;
    this._status = CONTINUE;
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
    this.playSequence();
    this.updateStatus(this.playerInputCb());

    switch (this._status){
      case ROUND_WON:
        this.incrementCount();
        this.resetMatches();
        this.addColorToPattern();
        this.roundWonCb();
        return;
      case ROUND_LOST:
        this.roundLostCb();
        return;
      case CONTINUE_ROUND:
        this.incrementMatches();
        this.continueRoundCb();
        return;
      default:
        this.gameOver();
        return;
    }
  }

  playSequence() {
    this.pattern.forEach((color) => {
      console.log(color);
    });
  }
  gameOver() {
    this.gameOverCb();
  }
}

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
