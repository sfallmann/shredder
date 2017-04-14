const COLORS = ['BLUE', 'RED', 'GREEN', 'YELLOW'];
const SOUNDS = {
  BLUE: 'audio/blue-sound.mp3',
  RED: 'audio/red-sound.mp3',
  GREEN: 'audio/green-sound.mp3',
  YELLOW: 'audio/yellow-sound.mp3',
}

const STATUS = {
  LOSE: 0,
  WIN: 1,
  INPROGRESS: 2
}

function getColor() {
  const random = Math.floor(Math.random() * 4);
  return COLORS[random];
}

function newColorPattern(pattern) {
  const newPattern = pattern.slice();
  newPattern.push(getColor());
  return newPattern;
}

function gameStatus(match, count) {
  if (match === false){
    return STATUS.LOSE;
  } else if (round === 20) {
    return STATUS.WIN;
  }

  return INPROGRESS;
}

const gameState = {
  count: 0,
  pattern: []
};
