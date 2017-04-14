'use strict';

var COLORS = ['BLUE', 'RED', 'GREEN', 'YELLOW'];
var SOUNDS = {
  BLUE: 'audio/blue-sound.mp3',
  RED: 'audio/red-sound.mp3',
  GREEN: 'audio/green-sound.mp3',
  YELLOW: 'audio/yellow-sound.mp3'
};

var STATUS = {
  LOSE: 0,
  WIN: 1,
  INPROGRESS: 2
};

function getColor() {
  var random = Math.floor(Math.random() * 4);

  return COLORS[random];
}

function newColorPattern(pattern) {
  var newPattern = pattern.slice();
  newPattern.push(getColor());
  return newPattern;
}

function gameStatus(match, count) {
  if (match === false) {
    return STATUS.LOSE;
  } else if (round === 20) {
    return STATUS.WIN;
  }

  return INPROGRESS;
}

var gameState = {
  count: 0,
  pattern: []
};