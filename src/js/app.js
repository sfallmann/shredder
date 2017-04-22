
;
(function() {
  //##### Title Screen ####

  $('#how-to-play-btn, #how-to-play-img').click(function() {
    howToPlay();
  });

  // toggles visibility of the game instructions
  function howToPlay() {
    $('#how-to-play-img').toggleClass('hide');
  }

  $('#fullscreen').click(function() {
    launchIntoFullscreen(document.documentElement);
  });

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
  var thudSound = new Howl({src: ['assets/audio/thud.mp3'], preload: true});
  var vaiShred = new Howl({
    src: ['assets/audio/vai-style-shred-2.mp3'],
    preload: true,
    loop: true
  });

  // audio toggle button click event actions
  $('#audio-control').on('click', function() {
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

      // preload the main game screen
      this.loadMain();

      // load the logo svg
      $.get('assets/img/shredder-logo-2.svg', function(doc) {
        // set the innerHTML of #logo to the svg in the loaded document
        $('#logo').html($(doc.querySelector('svg')));
        // the logo text "Shredder"
        const $logo = $('#logo-text');
        // all the paths in the logo text
        const $logoPaths = $('#logo-text path');
        // the "shred"" part of "Shredder"
        const $shred = $logoPaths.slice(0, 5);
        $shred.css('opacity', '0');
        // the "der"" part of "Shredder"
        const $der = $logoPaths.slice(5);
        $der.css('opacity', '0');
        // the play game pick
        const $playGame = $('#play-game-pick svg');
        // the animation for the pick to make it rotate
        const pickAnimation = TweenMax.to($playGame, 3, {
          rotationY: 360,
          ease: Linear.easeNone,
          repeat: -1
        });

        // click event action for the pick
        $playGame.on('click', function() {
          // pause the title screen animations
          pickAnimation.pause();
          logoAnimation.pause();
          // stop the title screen music
          vaiShred.stop();
          // fade out the game title screen and prevent it's rendering
          TweenMax.to('#game-title', 2, {opacity: 0, display: 'none'});
          TweenMax.to('#how-to-play-wrapper', 2, {opacity: 0, display: 'none'});
          // fade in the main game screen and set it's display so it renders
          TweenMax.to('#game-main', 2, {
            opacity: 1,
            display: 'block',
            delay: 2.5
          });
          // initializes the game and game ui
          playGame();
        });

        // the logo animation and log animation controls
        var logoAnimation = {
          timeline: new TimelineMax(),
          init: function init() {
            this.timeline.add(TweenMax.to($shred, 0, {'opacity': 1}));
            this.timeline.add(TweenMax.from($shred, .3, {y: -60}));
            this.timeline.add(TweenMax.to($shred, .05, {y: -2}));
            this.timeline.add(TweenMax.to($shred, .05, {y: 0}));
            this.timeline.add(TweenMax.to($shred, .05, {y: -1}));
            this.timeline.add(TweenMax.to($shred, .05, {y: 0}));
            this.timeline.add(TweenMax.to($der, .1, {'opacity': 1}));
            this.timeline.add(TweenMax.from($der, .5, {y: -200, scale: 6}));
            this.timeline.add(TweenMax.to($('#by-line'), 1, {
              opacity: 1, delay: 1
            }));
            this.timeline.add(TweenMax.to($logoPaths, .6, {
              scale: 1.035, repeat: -1, yoyo: true, delay: -.75
            }));
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
        vaiShred.on('end', function() {
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
      $.get('assets/img/guitar-neck-2.svg', function(doc) {
        $('#play-area').html($(doc.querySelector('svg')));
      });
    },
    loadGameWon: function loadGameWon() {
      const metalVictory = new Howl({
        src: ['assets/audio/game-won.mp3'],
        preload: true
      });

      $.get('assets/img/fire-and-horns.svg', function(doc) {

        $('#game-won').html($(doc.querySelector('svg')));
        const fireAnim = new TimelineMax();
        fireAnim.to('#game-main', 1, {opacity: 0, display: 'none'}, 0);
        fireAnim.to('#game-over', 1, {opacity: 1, display: 'block'}, 0);
        fireAnim.from('#fire-and-horns', 4, {y: 1200}, 1);      
        fireAnim.to("#fire-outline", 1, {
          stroke: '#f1d23a',
          opacity: .85,
          repeat:-1,
          yoyo: true,
          ease: SteppedEase.config(20)
        }, 1);          
        metalVictory.play();

        $('#game-over').on('click', function() {
          location.reload();
        });

      });
    }

  };

  function playGame() {

    // instantiate a new Simon
    const game = new Simon();

    // tracks the button clicked
    let clickedColor;
    // base speed of the audio playback
    let speed = 1;
    // the rate of increase for the audio playback
    const rate = .00725;

    // sound object for playing the color sounds
    // methods are wrappers around Howls for additional functionality
    const sound = {
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
      stopAll: function() {
        this._audioFiles.blue.stop();
        this._audioFiles.red.stop();;
        this._audioFiles.green.stop();
        this._audioFiles.yellow.stop();
      },
      // plays the audio value mapped to the passed in key
      // passes in the playback rate "speed" and also
      // passed in a callback to invoke after the audio completes
      stop: function stop(key, cb) {
        this._audioFiles[key].stop();
        // if the callback is actually a function invoke it
        if (typeof cb === 'function') {
          // turn the colors light off
          lightOff(key);
          cb();
        }
      },
      play: function play(key, speed, cb) {

        this._audioFiles[key].once('end', () => {
          // if the callback is actually a function invoke it
          if (typeof cb === 'function') {
            // turn the colors light off
            lightOff(key);
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
      playing: function playing(key) {
        return this._audioFiles[key].playing();
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
        this.ids.forEach((id) => {
          clearTimeout(id);
        });
        this.ids = [];
      },
      // clears [id] timeout and removes it from the ids array
      clear: function clear(id) {
        const index = this.ids.indexOf(id);
        if (index > -1) {
          console.log(this.ids[index], clickCheck);
          clearTimeout(id);
          this.ids.splice(index, 1);
        }
      }
    };

    // flashes the lights on the colors to tell player they are clickable
    var readyAnim = TweenMax.to('.color-btn', .5, {
      'opacity': .99,
      repeat: -1,
      yoyo: true
    });
    readyAnim.pause();

    // turns the light on
    function lightOn(color) {
      $('#' + color).css('opacity', '.99');
    }

    // turns the light off
    function lightOff(color) {
      $('#' + color).css('opacity', '.25');
    }

    function allLightsOff() {
      $('.color-btn').css('opacity', '.25');
    }

    // strick button click event actions
    $('#strict-btn').click(function() {
      var strict = !($(this).data('strict'));
      $(this).data('strict', strict);
      $(this).toggleClass('opaque').toggleClass('transparent');
    });

    function resetComponents() {
      sound.stopAll();
      timeouts.clearAll();
      $messages.addClass('hide');
      readyAnim.restart();
      readyAnim.pause();
      allLightsOff();
      removeClickable();
      updateCount(game.count());
    }

    $('#start-btn').on('click', () => {
      // sets the configuration for the game
      const config = {
        mode: gameMode(),
        maxTurns: 20,
        playerInput,
        gameOver,
        roundLost,
        roundWon,
        continueRound
      };

      // initializes the game with config options
      game.init(config);

      // resets everything
      resetComponents();
      $messages.text('Round ' + (game.count() + 1)).toggleClass('hide');
      timeouts.ids.push(setTimeout(() => {
        delaySequence(game.pattern(), 0, function() {
          $messages.toggleClass('hide');
        });
      }, 1500));
    });

    const $messages = $('#messages');

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
      readyAnim.restart();
      readyAnim.pause();
    }

    // updates the counter value on screen
    function updateCount(count) {
      $('#count').text(count + 1);
    }

    // color button click event actions
    $('.color-btn').click(function() {

      // only do something if it's clickable
      if ($(this).hasClass('clickable')) {
        if (clickedColor) {
          sound.stop(clickedColor);
          lightOff(clickedColor);
        }

        timeouts.clearAll();
        removeClickable();
        clickedColor = $(this).attr('id');
        sound.play(clickedColor, speed);
        lightOn(clickedColor);
        game.turn();
      }
    });

    // function for getting the player's input
    function playerInput() {
      return clickedColor;
    }

    // callback for when the round continues
    function continueRound() {
      trackPlayerResponse();
      addClickable();
    }

    function roundWon() {
      timeouts.clearAll();
      removeClickable();
      clickedColor = '';
      speed = ((game.count() + 1) * rate) + 1;

      setTimeout(() => {
        $messages.text('Good job!').toggleClass('hide');
        setTimeout(function() {
          updateCount(game.count());
          $messages.text('Round ' + (game.count() + 1));
          delaySequence(game.pattern(), 2000, function() {
            $messages.toggleClass('hide');
          });
        }, 2000);
      }, 2000);
    }

    // callback for when the round is lost
    function roundLost() {
      timeouts.clearAll();
      removeClickable();

      if (clickedColor) {
        sound.stop(clickedColor);
      }

      clickedColor = '';
      $messages.text('Doh! Wrong riff!').toggleClass('hide');
      sound.play('mistake', 1, function() {
        setTimeout(function() {
          $messages.text('Let me show you how to play that again');
          delaySequence(game.pattern(), 2000, function() {
            $messages.toggleClass('hide');
          });
        }, 2000);
      });
    }

    // callback for gameover - passed in the status - win or loss
    function gameOver(status) {
      removeClickable();
      if (status === GAME_WON) {
        $messages
          .text('You did it! You played the entire song.')
          .toggleClass('hide');
        setTimeout(function() {
          $messages.text('YOU ROCK!');
          setTimeout(function() {
            //$('#start-btn').trigger('click');
            gameScreens.loadGameWon();
          }, 2000);
        }, 2000);
      } else {
        sound.stop(clickedColor);
        $messages
          .text('How \'bout we play a different song?')
          .toggleClass('hide');
        setTimeout(function() {
          $messages.text('Starting a new game');
          setTimeout(function() {
            $('#start-btn').trigger('click');
          }, 2000);
        }, 2000);
      }
    }

    function delaySequence(pattern, startDelay, cb) {
      setTimeout(() => {
        cb();
        removeClickable();
        playSequence(game.pattern());
      }, startDelay);
    }

    function playSequence(pattern) {
      if (pattern.length) {
        const color = pattern.shift();
        sound.play(color, speed, function() {
          playSequence(pattern);
        });
      } else {
        readyAnim.play();
        addClickable();
        trackPlayerResponse();
      }
    }

    function trackPlayerResponse() {
      timeouts.ids.push(setTimeout(() => {
        game.turn();
      }, 5000));
    }

  }

  // load the title screen
  gameScreens.loadTitle();
})();
