'use strict';

function playGame() {
  var game = new Simon();
  var clickedColor = void 0;
  var clickCheck = void 0;
  var speed = 1;
  var rate = .00725;

  //var readyAnimation = TweenMax.to('.color-btn', .5, {"fill-opacity": .99, repeat: -1, yoyo: true});

  var sound = {
    _audioFiles: {
      blue: new Howl({
        src: ['assets/audio/blue-3.mp3']
      }),
      red: new Howl({
        src: ['assets/audio/red-3.mp3']
      }),
      green: new Howl({
        src: ['assets/audio/green-3.mp3']
      }),
      yellow: new Howl({
        src: ['assets/audio/yellow-3.mp3']
      }),
      mistake: new Howl({
        src: ['assets/audio/mistake-sound.mp3']
      })
    },
    play: function play(key, speed, cb) {
      console.log(speed);
      this._audioFiles[key].once('end', function () {
        toggleLight(key);

        if (typeof cb === 'function') {
          cb();
        }
      });
      toggleLight(key);
      this._audioFiles[key].rate(speed);
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

  $('#strict-btn').click(function () {
    var strict = !$(this).data('strict');
    $(this).data('strict', strict);
    $(this).toggleClass('opaque').toggleClass('transparent');
  });

  function gameMode() {
    if ($('#strict-btn').data('strict')) {
      return STRICT;
    }
    return NORMAL;
  }

  function addClickable() {
    $('.color-btn').addClass('clickable');
  }

  function removeClickable() {
    $('.clickable').removeClass('clickable');
  }

  function toggleLight(color) {
    $('#' + color).toggleClass('light-on').toggleClass('light-off');
  }

  function updateCount(count) {
    $('#count').text(count + 1);
  }

  $('#start-btn').click(function () {
    console.log('start button clicked');
    var config = {
      mode: gameMode(),
      maxTurns: 10,
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
    delaySequence(game.pattern(), 250, 0);
  });

  $('.color-btn').click(function () {
    console.log($(this).attr('id'), ' clicked');
    if ($(this).hasClass('clickable')) {
      removeClickable();
      clickedColor = $(this).attr('id');
      timeouts.clearAll();
      game.turn();
    }
  });

  function playerInputCb() {
    return clickedColor;
  }

  function continueRoundCb() {
    sound.play(clickedColor, speed, function () {
      $messages.text('Keep going!');
      addClickable();
      trackPlayerResponse();
      clickedColor = '';
    });
  }

  function roundWonCb() {
    speed = (game.count() + 1) * rate + 1;
    sound.play(clickedColor, speed, function () {
      timeouts.clearAll();
      clickedColor = '';
      updateCount(game.count());
      $messages.text('You did it! Here\'s a new sequence');
      console.log('round-won');

      delaySequence(game.pattern(), 250, 0);
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
    sound.play('mistake', 1, function () {
      delaySequence(game.pattern(), 250, 0);
      console.log('round-lost');
    });
  }

  function gameOverCb(status) {
    removeClickable();
    var msg = 'Game over! ' + status + ': Starting new game';
    console.log('game-over!', status);
    if (status === GAME_WON) {
      sound.play(clickedColor, speed, function () {
        $messages.text(msg);
        alert('starting a new game');
        $('#start').trigger('click');
      });
    } else {
      sound.play('mistake', 1, function () {
        $messages.text(msg);
        alert('starting a new game');
        $('#start').trigger('click');
      });
    }
  }

  function delaySequence(pattern, startDelay, seqDelay) {
    setTimeout(function () {
      playSequence(game.pattern(), seqDelay);
    }, startDelay);
  }

  function playSequence(pattern, delay) {
    console.log('sequence delay: ', delay);
    if (pattern.length) {
      var color = pattern.shift();
      sound.play(color, speed, function () {
        timeouts.ids.push(setTimeout(function () {
          playSequence(pattern, delay);
        }, 0));
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
}