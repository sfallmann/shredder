'use strict';

var sound = {
  _audioFiles: {
    blue: new Howl({ src: ['assets/audio/blue-sound.mp3'] }),
    red: new Howl({ src: ['assets/audio/red-sound.mp3'] }),
    green: new Howl({ src: ['assets/audio/green-sound.mp3'] }),
    yellow: new Howl({ src: ['assets/audio/yellow-sound.mp3'] }),
    mistake: new Howl({ src: ['assets/audio/mistake-sound.mp3'] })
  },
  play: function play(key) {

    var args = [].slice.call(arguments);

    this._audioFiles[key].once('play', function () {
      toggleLight(key);

      if (typeof args[1] === 'function') {
        args[1]();
      }
    });
    this._audioFiles[key].once('stop', function () {
      toggleLight(key);

      if (typeof args[2] === 'function') {
        args[2]();
      }
    });
    this._audioFiles[key].once('end', function () {
      toggleLight(key);

      if (typeof args[3] === 'function') {
        args[3]();
      }
    });

    this._audioFiles[key].play();
  },
  stop: function stop(key) {
    this._audioFiles[key].stop();
  }
};

var clickedColor = void 0;
var clickCheck = void 0;
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
      clearTimeout(id);
      this.ids.splice(index, 1);
    }
  }
};

var $messages = $('#messages');

function addClickable() {
  $('[id*="-btn"]').addClass('clickable');
}

function removeClickable() {
  $('.clickable').removeClass('clickable');
}

function gameMode() {
  if ($('[name=strict]').is(':checked')) {
    return 'STRICT';
  }

  return 'NORMAL';
}

function updateCount(count) {
  $('#count').text(count);
}

$('#start').click(function () {

  var config = {
    mode: gameMode(),
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
  delaySequence(game.pattern(), 500, 1000);
});

$('[id*="-btn"]').click(function () {
  if ($(this).hasClass('clickable')) {
    clickedColor = $(this).data('color');
    timeouts.clear(clickCheck);
    console.log('clicked', clickedColor);
    sound.play(clickedColor);
    removeClickable();
    game.turn();
  }
});

function playerInputCb() {
  return clickedColor;
}

function gameOverCb(status) {
  $messages.text('Game over! ' + status);
  console.log('game-over!', status);
}

function roundWonCb() {

  clickedColor = '';
  updateCount(game.count());
  $messages.text('You did it! Here\'s a new sequence');
  delaySequence(game.pattern(), 1000, 1000);
  console.log('round-won');
}

function roundLostCb() {

  if (clickedColor) {
    sound.stop(clickedColor);
    clickedColor = '';
  }
  $messages.text('You made a mistake! Lets\'s play the sequence again');
  sound.play('mistake', null, null, function () {
    delaySequence(game.pattern(), 1000, 1000);
    console.log('round-lost');
  });
}

function continueRoundCb() {

  trackPlayerResponse();
  addClickable();
  $messages.text('Keep going!');
  clickedColor = '';
  console.log('continue-round');
}

function toggleLight(color) {
  $('#' + color + '-btn').toggleClass(color).toggleClass('light' + color);
}

function playSequence(pattern, delay) {

  if (pattern.length) {
    var color = pattern.shift();

    sound.play(color, null, null, function () {
      timeouts.ids.push(setTimeout(function () {
        playSequence(pattern, delay);
      }, delay));
    });
  } else {
    console.log('done with pattern!');
    addClickable();
    trackPlayerResponse();
  }
}

function trackPlayerResponse() {
  timeouts.ids.push(setTimeout(function () {
    console.log('Nothing clicked in 2 seconds!');
    game.turn();
  }, 2000));
  clickCheck = timeouts.ids[timeouts.ids.length - 1];
  console.log('click check', clickCheck);
}

var game = new Simon();

function delaySequence(pattern, startDelay, seqDelay) {
  setTimeout(function () {
    playSequence(game.pattern(), seqDelay);
  }, startDelay);
}