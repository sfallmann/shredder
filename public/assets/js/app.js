'use strict';

var game = new Simon();
var clickedColor = void 0;
var clickCheck = void 0;

var sound = {
  _audioFiles: {
    blue: new Howl({
      src: ['assets/audio/blue-sound.mp3']
    }),
    red: new Howl({
      src: ['assets/audio/red-sound.mp3']
    }),
    green: new Howl({
      src: ['assets/audio/green-sound.mp3']
    }),
    yellow: new Howl({
      src: ['assets/audio/yellow-sound.mp3']
    }),
    mistake: new Howl({
      src: ['assets/audio/mistake-sound.mp3']
    })
  },
  play: function play(key, cb) {

    this._audioFiles[key].once('end', function () {
      toggleLight(key);

      if (typeof cb === 'function') {
        cb();
      }
    });

    this._audioFiles[key].play();
  },
  stop: function stop(key) {
    this._audioFiles[key].stop();
  }
};

var timeouts = {
  ids: [],
  clearAll: function clearAll() {
    this.ids.forEach(function (id) {
      clearTimeout(id);
    });
    this.ids = [];
  },
  clear: function clear(id) {
    var index = this.ids.indexOf(id);
    if (index > -1) {
      console.log(this.ids[index], clickCheck);
      clearTimeout(id);
      this.ids.splice(index, 1);
    }
  }
};

var $messages = $('#messages');

function gameMode() {
  if ($('[name=strict]').is(':checked')) {
    return 'STRICT';
  }

  return 'NORMAL';
}

function addClickable() {
  $('[id*="-btn"]').addClass('clickable');
}

function removeClickable() {
  $('.clickable').removeClass('clickable');
}

function toggleLight(color) {
  $('#' + color + '-btn').toggleClass(color).toggleClass('light' + color);
}

function updateCount(count) {
  $('#count').text(count + 1);
}

$('#start').click(function () {

  var config = {
    mode: gameMode(),
    maxTurns: 3,
    playerInputCb: playerInputCb,
    gameOverCb: gameOverCb,
    roundLostCb: roundLostCb,
    roundWonCb: roundWonCb,
    continueRoundCb: continueRoundCb
  };

  game.init(config);
  timeouts.clearAll();
  removeClickable();
  updateCount(game.count());
  delaySequence(game.pattern(), 250, 350);
});

$('[id*="-btn"]').click(function () {
  if ($(this).hasClass('clickable')) {
    removeClickable();
    clickedColor = $(this).data('color');
    timeouts.clearAll();
    game.turn();
  }
});

function playerInputCb() {
  return clickedColor;
}

function continueRoundCb() {
  sound.play(clickedColor, function () {
    $messages.text('Keep going!');
    addClickable();
    trackPlayerResponse();
    clickedColor = '';
  });
}

function roundWonCb() {
  sound.play(clickedColor, function () {
    timeouts.clearAll();
    clickedColor = '';
    updateCount(game.count());
    $messages.text('You did it! Here\'s a new sequence');
    console.log('round-won');
    delaySequence(game.pattern(), 250, 350);
  });
}

function roundLostCb() {
  removeClickable();
  timeouts.clearAll();
  console.log('playerInput', game.playerInput(), 'clickedColor', clickedColor);
  if (game.playerInput()) {
    $messages.text('You made a mistake! Lets\'s play the sequence again');
  } else {
    $messages.text('You didn\'t click anything!');
  }
  sound.play('mistake', function () {
    delaySequence(game.pattern(), 250, 500);
    console.log('round-lost');
  });
}

function gameOverCb(status) {
  removeClickable();
  sound.play(clickedColor, function () {
    $messages.text('Game over! ' + status);
    console.log('game-over!', status);
  });
}

function delaySequence(pattern, startDelay, seqDelay) {
  setTimeout(function () {
    playSequence(game.pattern(), seqDelay);
  }, startDelay);
}

function playSequence(pattern, delay) {

  if (pattern.length) {
    var color = pattern.shift();
    sound.play(color, function () {
      timeouts.ids.push(setTimeout(function () {
        playSequence(pattern, delay);
      }, delay));
    });
  } else {
    addClickable();
    trackPlayerResponse();
  }
}

function trackPlayerResponse() {
  timeouts.ids.push(setTimeout(function () {
    console.log('Nothing clicked in 5 seconds!');
    game.turn();
  }, 5000));
  clickCheck = timeouts.ids[timeouts.ids.length - 1];
  console.log('click check', clickCheck);
}