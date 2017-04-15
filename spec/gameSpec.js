const {
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
} = require('../src/js/game');

describe('Simon', function() {

  let selectedColor;

  function cb() {
    return selectedColor;
  }

  const strictConfig = {
    mode: STRICT,
    playerInputCb: cb
  };

  const normalConfig = {
    mode: NORMAL,
    playerInputCb: cb
  };

  describe('property /pattern', function() {
    it('should start with a color and have a length of 1', function() {
      const game = new Simon(normalConfig);
      expect(game.pattern().length).toEqual(1);
      expect(COLORS.indexOf(game.pattern()[0])).toBeGreaterThan(-1);
    });
  });

  describe('method /getColor', function() {
    it('should return a color', function() {
      const color = Simon.getColor();
      expect(COLORS.indexOf(color)).toBeGreaterThan(-1);
    });
  });

  describe('method /colorMatch', function() {
    it('should check if the colors are equal', function() {
      const color1 = COLORS[0];
      const color2 = COLORS[0];
      const color3 = COLORS[1];
      expect(Simon.colorMatch(color1, color2)).toBeTruthy();
      expect(Simon.colorMatch(color1, color3)).toBeFalsy();
    });
  });

  describe('method /checkForMatch', function() {
    it('should return MATCH if the color arg matches patternColor()', function() {
      const game = new Simon(normalConfig);
      const color = game.patternColor();
      expect(game.checkForMatch(color)).toEqual(MATCH);
    });
    it('should return NO_MATCH if the color arg does not match patternColor()', function() {
      const game = new Simon(normalConfig);
      const color = 'NOT_THE_COLOR';
      expect(game.checkForMatch(color)).toEqual(NO_MATCH);
    });
  });

  describe('method /updateGameState', function() {
    it('getStatus() should return GAME_LOST in strict mode if checkForColor() returns NO_MATCH', function() {
      const game = new Simon(strictConfig);
      selectedColor = 'NOT_THE_COLOR';
      expect(game.checkForMatch(game.playerInputCb())).toEqual(NO_MATCH);
      game.updateStatus(game.playerInputCb());
      expect(game.getStatus()).toEqual(GAME_LOST);
    });
    it('getStatus() should return ROUND_LOST in normal mode if checkForColor() returns NO_MATCH', function() {
      const game = new Simon(normalConfig);
      selectedColor = 'NOT_THE_COLOR';
      expect(game.checkForMatch(game.playerInputCb())).toEqual(NO_MATCH);
      game.updateStatus(game.playerInputCb());
      expect(game.getStatus()).toEqual(ROUND_LOST);
    });
    it('getStatus() should return CONTINUE_ROUND if checkForColor() returns MATCH and there are more colors in the pattern', function() {
      const game = new Simon(normalConfig);
      selectedColor = game.patternColor();
      game.addColorToPattern();
      game.incrementCount();
      game.updateStatus(game.playerInputCb());
      expect(game.getStatus()).toEqual(CONTINUE_ROUND);
    });
    it('getStatus() should return ROUND_WON if checkForColor() returns MATCH and there are no more colors to match', function() {
      const game = new Simon(normalConfig);
      selectedColor = game.patternColor();
      game.updateStatus(game.playerInputCb());
      expect(game.getStatus()).toEqual(ROUND_WON);
    });

  });

});
