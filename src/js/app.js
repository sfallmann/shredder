function playGame() {
  const game = new Simon();
  let clickedColor;
  let clickCheck;
  const speed = 500;

  const sound = {
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

      this._audioFiles[key].once('end', () => {
        toggleLight(key);

        if (typeof cb === 'function') {
          cb();
        }
      });
      toggleLight(key);
      this._audioFiles[key].play();

    },
    stop: function stop(key) {
      this._audioFiles[key].stop();
    }
  };

  var timeouts = {
    ids: [],
    clearAll: function clearAll(){
      this.ids.forEach((id) => {
        clearTimeout(id);
      });
      this.ids = [];
    },
    clear: function clear(id) {
      const index = this.ids.indexOf(id);
      if (index > -1){
        console.log(this.ids[index], clickCheck);
        clearTimeout(id);
        this.ids.splice(index, 1);
      }
    }
  };

  const $messages = $('#messages');

  function gameMode() {
    if ($('[name=strict]').is(':checked')) {
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

  $('#start-btn').click(() => {
    console.log('start button clicked');
    const config = {
      mode: gameMode(),
      maxTurns: 3,
      playerInputCb,
      gameOverCb,
      roundLostCb,
      roundWonCb,
      continueRoundCb
    };

    game.init(config);
    timeouts.clearAll();
    removeClickable();
    updateCount(game.count());
    delaySequence(game.pattern(), 250, speed - (game.count() * 20));
  })

  $('.color-btn').click(function() {
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
    sound.play(clickedColor, function() {
      $messages.text('Keep going!');
      addClickable();
      trackPlayerResponse();
      clickedColor = '';
    });
  }

  function roundWonCb() {
    sound.play(clickedColor, function() {
      timeouts.clearAll();
      clickedColor = '';
      updateCount(game.count());
      $messages.text('You did it! Here\'s a new sequence');
      console.log('round-won');

      delaySequence(game.pattern(), 250, speed - (game.count() * 20));
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
    sound.play('mistake', function() {
      delaySequence(game.pattern(), 250, 500);
      console.log('round-lost');
    });
  }

  function gameOverCb(status) {
    removeClickable();
    const msg = 'Game over! ' + status + ': Starting new game';
    console.log('game-over!', status);
    if (status === GAME_WON) {
      sound.play(clickedColor, function() {
        $messages.text(msg);
        alert('starting a new game');
        $('#start').trigger('click');
      });
    } else {
      sound.play('mistake', function() {
        $messages.text(msg);
        alert('starting a new game');
        $('#start').trigger('click');
      });
    }

  }

  function delaySequence(pattern, startDelay, seqDelay){
    setTimeout(() => {
      playSequence(game.pattern(), seqDelay);
    }, startDelay);
  }

  function playSequence(pattern, delay) {
    console.log('sequence delay: ', delay);
    if (pattern.length) {
      const color = pattern.shift();
      sound.play(color, function() {
        timeouts.ids.push(setTimeout(() => {
          playSequence(pattern, delay);
        }, delay));
      });

    } else {
      addClickable();
      trackPlayerResponse();
    }

  }

  function trackPlayerResponse() {
    timeouts.ids.push(setTimeout(() => {
      console.log('Nothing clicked in 5 seconds!');
      game.turn();
    }, 5000));
    clickCheck = timeouts.ids[timeouts.ids.length - 1];
    console.log('click check', clickCheck);
  }

}
