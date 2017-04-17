'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var COLORS = ['blue', 'red', 'green', 'yellow'];

var GAME_LOST = 'GAME_LOST';
var GAME_WON = 'GAME_WON';
var CONTINUE_GAME = 'CONTINUE_GAME';
var MATCH = 'MATCH';
var NO_MATCH = 'NO_MATCH';
var ROUND_LOST = 'ROUND_LOST';
var ROUND_WON = 'ROUND_WON';
var CONTINUE_ROUND = 'CONTINUE_ROUND';
var STRICT = 'STRICT';
var NORMAL = 'NORMAL';

var Simon = function () {
  function Simon() {
    _classCallCheck(this, Simon);
  }

  _createClass(Simon, [{
    key: 'init',
    value: function init(config) {
      this.maxTurns = config.maxTurns;
      this.mode = config.mode;
      this.playerInput = config.playerInputCb;
      this.gameOver = config.gameOverCb;
      this.roundWon = config.roundWonCb;
      this.roundLost = config.roundLostCb;
      this.continueRound = config.continueRoundCb;
      this.playSound = config.playSoundCb;
      this._count = 0;
      this._status = '';
      this._matches = 0;
      this._pattern = [Simon.getColor()];
    }
  }, {
    key: 'incrementCount',
    value: function incrementCount() {
      this._count++;
    }
  }, {
    key: 'count',
    value: function count() {
      return this._count;
    }
  }, {
    key: 'resetMatches',
    value: function resetMatches() {
      this._matches = 0;
    }
  }, {
    key: 'incrementMatches',
    value: function incrementMatches() {
      this._matches++;
    }
  }, {
    key: 'matches',
    value: function matches() {
      return this._matches;
    }
  }, {
    key: 'getStatus',
    value: function getStatus(status) {
      return this._status;
    }
  }, {
    key: 'patternColor',
    value: function patternColor() {
      return this._pattern[this._matches];
    }
  }, {
    key: 'addColorToPattern',
    value: function addColorToPattern() {
      this._pattern.push(Simon.getColor());
    }
  }, {
    key: 'pattern',
    value: function pattern() {
      return this._pattern.slice();
    }
  }, {
    key: 'checkForMatch',
    value: function checkForMatch(color) {

      var match = Simon.colorMatch(color, this.patternColor());

      if (!match) {
        return NO_MATCH;
      }
      return MATCH;
    }
  }, {
    key: 'updateStatus',
    value: function updateStatus(playerInput) {
      var match = this.checkForMatch(playerInput);

      if (match === MATCH) {
        if (this.matches() === this.count() && this.count() < this.maxTurns) {
          this._status = ROUND_WON;
        } else {
          this._status = CONTINUE_ROUND;
        }
        if (this.count() === this.maxTurns - 1 && this._status === ROUND_WON) {
          this._status = GAME_WON;
        }
      } else {
        if (this.mode === STRICT) {
          this._status = GAME_LOST;
        } else {
          this._status = ROUND_LOST;
        }
      }
    }
  }, {
    key: 'turn',
    value: function turn() {

      this.updateStatus(this.playerInput());
      console.log(this._status, this.playerInput(), this.patternColor());

      switch (this._status) {
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
          this.gameOver(this.getStatus());
          return;
      }
    }
  }], [{
    key: 'getColor',
    value: function getColor() {
      var random = Math.floor(Math.random() * 4);

      return COLORS[random];
    }
  }, {
    key: 'colorMatch',
    value: function colorMatch(color1, color2) {
      return color1 === color2;
    }
  }]);

  return Simon;
}();

if (typeof module !== 'undefined') {
  module.exports = {
    Simon: Simon,
    COLORS: COLORS,
    GAME_LOST: GAME_LOST,
    GAME_WON: GAME_WON,
    CONTINUE_GAME: CONTINUE_GAME,
    MATCH: MATCH,
    NO_MATCH: NO_MATCH,
    ROUND_LOST: ROUND_LOST,
    ROUND_WON: ROUND_WON,
    CONTINUE_ROUND: CONTINUE_ROUND,
    STRICT: STRICT,
    NORMAL: NORMAL
  };
}