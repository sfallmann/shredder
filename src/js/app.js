const SOUNDS = {
  blue: new Howl({ src: ['assets/audio/blue-sound.mp3'] }),
  red: new Howl({ src: ['assets/audio/red-sound.mp3'] }),
  green: new Howl({ src: ['assets/audio/green-sound.mp3'] }),
  yellow: new Howl({ src: ['assets/audio/yellow-sound.mp3'] })
};

function playSound(color) {
  SOUNDS[color].play();
}

var clickedColor;

$('#greenBtn').click(function() {
  console.log('clicked green');
  clickedColor = 'green';
  playSound('green');
  game.turn();
});

$('#redBtn').click(function() {
  console.log('clicked red');
  clickedColor = 'red';
  playSound('red');
  game.turn();
});

$('#blueBtn').click(function() {
  console.log('clicked blue');
  clickedColor = 'blue';
  playSound('blue');
  game.turn();
});

$('#yellowBtn').click(function() {
  console.log('clicked yellow');
  clickedColor = 'yellow';
  playSound('yellow');
  game.turn();
});

function playerInputCb() {
  return clickedColor;
}

function gameOverCb() {
  console.log('game-over!');
}

function roundWonCb() {
  clickedColor = '';
  delaySequence(game.pattern());
  console.log('round-won');
}

function roundLostCb() {
  clickedColor = '';
  delaySequence(game.pattern());
  console.log('round-lost');
}

function continueRoundCb() {
  clickedColor = '';
  console.log('continue-round');
}

function playSequence(pattern) {

  if (pattern.length) {
    const color = pattern.shift();
    $('#' + color).toggleClass(color);
    playSound(color);

    setTimeout(() => {
      $('#' + color).toggleClass(color);
      playSequence(pattern)
    }, 1000);
  } else {
    // TODO: Disable player input
  }

}

const config = {
  mode: 'NORMAL',
  playerInputCb,
  gameOverCb,
  roundLostCb,
  roundWonCb,
  continueRoundCb
};

const game = new Simon(config);
delaySequence(game.pattern());

function delaySequence(pattern){
  setTimeout(() => {
    playSequence(game.pattern());
  }, 1000)
}



