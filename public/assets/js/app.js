'use strict';

//##### Title Screen ####

// toggles visibility of the game instructions
function howToPlay() {
  $('#how-to-play-img').toggleClass("hide");
}

// Thank you David Walsh! https://davidwalsh.name/fullscreen
function launchIntoFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

// tracks whether all Howls should be muted
var muteStatus;

// title screen audio
var thudSound = new Howl({ src: ['assets/audio/thud.mp3'], preload: true });
var vaiShred = new Howl({ src: ['assets/audio/vai-style-shred-2.mp3'], preload: true, loop: true });

// audio toggle button click event actions
$('#audio-control').on("click", function () {
  muteStatus = !muteStatus;
  if (muteStatus) {
    $(this).attr('src', 'assets/img/audio-off.svg');
  } else {
    $(this).attr('src', 'assets/img/audio-on.svg');
  }
  Howler.mute(muteStatus);
});

// gameScreens object
var gameScreens = {

  loadTitle: function loadTitle() {
    console.log(this);

    // preload the main game screen
    this.loadMain();

    // load the logo svg
    $.get('assets/img/shredder-logo-2.svg', function (doc) {
      // set the innerHTML of #logo to the svg in the loaded document
      $('#logo').html($(doc.querySelector('svg')));
      // the logo text "Shredder"
      var $logo = $('#logo-text');
      // all the paths in the logo text
      var $logoPaths = $('#logo-text path');
      // the "shred"" part of "Shredder"
      var $shred = $logoPaths.slice(0, 5);
      // the "der"" part of "Shredder"
      var $der = $logoPaths.slice(5);
      // the play game pick
      var $playGame = $('#play-game-pick svg');
      // the animation for the pick to make it rotate
      var pickAnimation = TweenMax.to($playGame, 3, { rotationY: 360, ease: Linear.easeNone, repeat: -1 });

      // click event action for the pick
      $playGame.on('click', function () {
        // pause the title screen animations
        pickAnimation.pause();
        logoAnimation.pause();
        // stop the title screen music
        vaiShred.stop();
        // fade out the game title screen and prevent it's rendering
        TweenMax.to('#game-title', 2, { opacity: 0, display: 'none' });
        TweenMax.to('#how-to-play-wrapper', 2, { opacity: 0, display: 'none' });
        // fade in the main game screen and set it's display so it renders
        TweenMax.to('#game-main', 2, { opacity: 1, display: 'block', delay: 2.5 });
        // initializes the game and game ui
        playGame();
      });

      // the logo animation and log animation controls
      var logoAnimation = {
        timeline: new TimelineMax(),
        init: function init() {
          this.timeline.add(TweenMax.to($shred, 0, { "stroke-opacity": 1, "fill-opacity": 1 }));
          this.timeline.add(TweenMax.from($shred, .3, { y: -60 }));
          this.timeline.add(TweenMax.to($shred, .05, { y: -2 }));
          this.timeline.add(TweenMax.to($shred, .05, { y: 0 }));
          this.timeline.add(TweenMax.to($shred, .05, { y: -1 }));
          this.timeline.add(TweenMax.to($shred, .05, { y: 0 }));
          this.timeline.add(TweenMax.to($der, .1, { "stroke-opacity": 1, "fill-opacity": 1 }));
          this.timeline.add(TweenMax.from($der, .5, { y: -200, scale: 6 }));
          this.timeline.add(TweenMax.to($('#by-line'), 1, { opacity: 1, delay: 1 }));
          this.timeline.add(TweenMax.to($logoPaths, .6, { scale: 1.035, repeat: -1, yoyo: true, delay: -.75 }));
          this.timeline.pause();
        },
        play: function play() {
          this.timeline.play();
        },
        pause: function pause() {
          this.timeline.pause();
        },
        restart: function restart() {
          this.timeline.restart();
        }
      };
      // initialize the "keyframes" for the logo animation
      logoAnimation.init();
      // start it up!
      logoAnimation.play();
      // fast forward the title screen song for better timing
      vaiShred.seek(2).play();
      // when the title song ends, start it all over again
      vaiShred.on('end', function () {
        thudSound.play();
        vaiShred.seek(2);
        logoAnimation.restart();
      });

      // play the thud sound
      thudSound.play();
    });
  },

  // set the innerHTML of #play-area to the svg in the loaded document
  loadMain: function loadMain() {
    $.get('assets/img/guitar-neck-2.svg', function (doc) {
      $('#play-area').html($(doc.querySelector('svg')));
    });
  }

};

function playGame() {

  // instantiate a new Simon
  var game = new Simon();

  // tracks the button clicked
  var clickedColor = void 0;
  // base speed of the audio playback
  var speed = 1;
  // the rate of increase for the audio playback
  var rate = .00725;

  // sound object for playing the color sounds
  // methods are wrappers around Howls for additional functionality
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
    // plays the audio value mapped to the passed in key
    // passes in the playback rate "speed" and also
    // passed in a callback to invoke after the audio completes
    play: function play(key, speed, cb) {

      this._audioFiles[key].once('end', function () {
        // turn the colors light off 
        lightOff(key);
        // if the callback is actually a function invoke it
        if (typeof cb === 'function') {
          cb();
        }
      });

      // turn the light on
      lightOn(key);
      // set the speed of audio
      this._audioFiles[key].rate(speed);
      // play the audio
      this._audioFiles[key].play();
    },
    stop: function stop(key) {
      this._audioFiles[key].stop();
    }
  };

  // timeout tracker
  var timeouts = {
    // tracks all timeout ids
    ids: [],
    // iterates through all the ids and clears them
    clearAll: function clearAll() {
      this.ids.forEach(function (id) {
        clearTimeout(id);
      });
      this.ids = [];
    },
    // clears [id] timeout and removes it from the ids array
    clear: function clear(id) {
      var index = this.ids.indexOf(id);
      if (index > -1) {
        console.log(this.ids[index], clickCheck);
        clearTimeout(id);
        this.ids.splice(index, 1);
      }
    }
  };

  // flashes the lights on the colors to tell player they are clickable
  var readyAnim = TweenMax.to('.color-btn', .5, { "fill-opacity": .99, repeat: -1, yoyo: true });
  readyAnim.pause();

  // turns the light on
  function lightOn(color) {
    $("#" + color).css("fill-opacity", ".99");
  }

  // turns the light off
  function lightOff(color) {
    $("#" + color).css("fill-opacity", ".25");
  }

  // strick button click event actions
  $('#strict-btn').click(function () {
    var strict = !$(this).data('strict');
    $(this).data('strict', strict);
    $(this).toggleClass('opaque').toggleClass('transparent');
  });

  $('#start-btn').click(function () {
    // sets the configuration for the game
    var config = {
      mode: gameMode(),
      maxTurns: 4,
      playerInputCb: playerInputCb,
      gameOverCb: gameOverCb,
      roundLostCb: roundLostCb,
      roundWonCb: roundWonCb,
      continueRoundCb: continueRoundCb
    };

    // initializes the game with config options
    game.init(config);
    // clears all the timeouts
    timeouts.clearAll();
    // makes the buttons unclickable
    removeClickable();
    // resets the game counter
    updateCount(game.count());
    $messages.addClass('hide');
    $messages.text('Round ' + (game.count() + 1)).toggleClass('hide');
    delaySequence(game.pattern(), 3500, function () {
      $messages.toggleClass('hide');
    });
  });

  var $messages = $('#messages');

  // returns the game mode
  function gameMode() {
    if ($('#strict-btn').data('strict')) {
      return STRICT;
    }
    return NORMAL;
  }

  // makes the buttons clickable
  function addClickable() {
    $('.color-btn').addClass('clickable');
  }

  // makes the buttons unclickable
  function removeClickable() {
    $('.clickable').removeClass('clickable');
  }

  // updates the counter value on screen
  function updateCount(count) {
    $('#count').text(count + 1);
  }

  // color button click event actions
  $('.color-btn').click(function () {

    // only do something if it's clickable
    if ($(this).hasClass('clickable')) {
      // restart and pause the animation 
      readyAnim.restart();
      readyAnim.pause();
      // make the buttons onclickable
      removeClickable();
      // get the id (which is equal to the color) of the clicked button
      clickedColor = $(this).attr('id');
      // clear the timeouts
      timeouts.clearAll();
      // calculate the results of this color selection
      game.turn();
    }
  });

  // callback for getting the player's input
  function playerInputCb() {
    return clickedColor;
  }

  // callback for when the round continues
  function continueRoundCb() {
    sound.play(clickedColor, speed, function () {
      readyAnim.play();
      addClickable();
      trackPlayerResponse();
      clickedColor = '';
    });
  }

  // callback for when the round is won
  function roundWonCb() {
    speed = (game.count() + 1) * rate + 1;
    sound.play(clickedColor, speed, function () {
      timeouts.clearAll();
      clickedColor = '';
      updateCount(game.count());
      $messages.text('Good job!').toggleClass('hide');
      setTimeout(function () {
        $messages.text('Round ' + (game.count() + 1));
        delaySequence(game.pattern(), 2000, function () {
          $messages.toggleClass('hide');
        });
      }, 2000);
    });
  }

  // callback for when the round is lost
  function roundLostCb() {
    readyAnim.restart();
    readyAnim.pause();
    removeClickable();
    timeouts.clearAll();
    $messages.text('Doh! Wrong riff!').toggleClass('hide');
    sound.play('mistake', 1, function () {
      setTimeout(function () {
        $messages.text('Let me show you how to play that again');
        delaySequence(game.pattern(), 2000, function () {
          $messages.toggleClass('hide');
        });
      }, 2000);
    });
  }

  // callback for gameover - passed in the status - win or loss
  function gameOverCb(status) {
    removeClickable();
    if (status === GAME_WON) {
      sound.play(clickedColor, speed, function () {
        $messages.text('You did it! You played the entire song.').toggleClass('hide');
        setTimeout(function () {
          $messages.text('Let\'s play another game!');
          delaySequence(game.pattern(), 2000, function () {
            $messages.toggleClass('hide');
            $('#start-btn').trigger('click');
          });
        }, 2000);
      });
    } else {
      sound.play('mistake', 1, function () {
        $messages.text('How \'bout we play a different song?').toggleClass('hide');
        setTimeout(function () {
          $messages.text('Starting a new game');
          delaySequence(game.pattern(), 2000, function () {
            $messages.toggleClass('hide');
            $('#start-btn').trigger('click');
          });
        }, 2000);
      });
    }
  }

  function delaySequence(pattern, startDelay, cb) {
    setTimeout(function () {
      cb();
      playSequence(game.pattern());
    }, startDelay);
  }

  function playSequence(pattern) {
    if (pattern.length) {
      var color = pattern.shift();
      sound.play(color, speed, function () {
        playSequence(pattern);
      });
    } else {
      readyAnim.play();
      addClickable();
      trackPlayerResponse();
    }
  }

  function trackPlayerResponse() {
    timeouts.ids.push(setTimeout(function () {
      game.turn();
    }, 5000));
  }
}

// load the title screen
gameScreens.loadTitle();