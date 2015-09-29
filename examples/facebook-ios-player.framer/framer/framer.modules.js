require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"audio":[function(require,module,exports){
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.AudioPlayer = (function(superClass) {
  extend(AudioPlayer, superClass);

  function AudioPlayer(options) {
    if (options == null) {
      options = {};
    }
    this.getTimeLeft = bind(this.getTimeLeft, this);
    if (options.backgroundColor == null) {
      options.backgroundColor = "transparent";
    }
    this.player = document.createElement("audio");
    this.player.setAttribute("webkit-playsinline", "true");
    this.player.setAttribute("preload", "auto");
    this.player.style.width = "100%";
    this.player.style.height = "100%";
    this.player.on = this.player.addEventListener;
    this.player.off = this.player.removeEventListener;
    AudioPlayer.__super__.constructor.call(this, options);
    this.controls = new Layer({
      backgroundColor: "transparent",
      width: 80,
      height: 80,
      superLayer: this,
      name: "controls"
    });
    this.controls.showPlay = function() {
      return this.image = "images/play.png";
    };
    this.controls.showPause = function() {
      return this.image = "images/pause.png";
    };
    this.controls.showPlay();
    this.controls.center();
    this.timeStyle = {
      "font-size": "20px",
      "color": "#000"
    };
    this.on(Events.Click, function() {
      var currentTime, duration;
      currentTime = Math.round(this.player.currentTime);
      duration = Math.round(this.player.duration);
      if (this.player.paused) {
        this.player.play();
        this.controls.showPause();
        if (currentTime === duration) {
          this.player.currentTime = 0;
          return this.player.play();
        }
      } else {
        this.player.pause();
        return this.controls.showPlay();
      }
    });
    this.player.onplaying = (function(_this) {
      return function() {
        return _this.controls.showPause();
      };
    })(this);
    this.player.onended = (function(_this) {
      return function() {
        return _this.controls.showPlay();
      };
    })(this);
    this.player.formatTime = function() {
      var min, sec;
      sec = Math.floor(this.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : '0' + sec;
      return min + ":" + sec;
    };
    this.player.formatTimeLeft = function() {
      var min, sec;
      sec = Math.floor(this.duration) - Math.floor(this.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : '0' + sec;
      return min + ":" + sec;
    };
    this.audio = options.audio;
    this._element.appendChild(this.player);
  }

  AudioPlayer.define("audio", {
    get: function() {
      return this.player.src;
    },
    set: function(audio) {
      this.player.src = audio;
      if (this.player.canPlayType("audio/mp3") === "") {
        throw Error("No supported audio file included.");
      }
    }
  });

  AudioPlayer.define("showProgress", {
    get: function() {
      return this._showProgress;
    },
    set: function(showProgress) {
      return this.setProgress(showProgress, false);
    }
  });

  AudioPlayer.define("showVolume", {
    get: function() {
      return this._showVolume;
    },
    set: function(showVolume) {
      return this.setVolume(showVolume, false);
    }
  });

  AudioPlayer.define("showTime", {
    get: function() {
      return this._showTime;
    },
    set: function(showTime) {
      return this.getTime(showTime, false);
    }
  });

  AudioPlayer.define("showTimeLeft", {
    get: function() {
      return this._showTimeLeft;
    },
    set: function(showTimeLeft) {
      return this.getTimeLeft(showTimeLeft, false);
    }
  });

  AudioPlayer.prototype._checkBoolean = function(property) {
    var ref, ref1;
    if (_.isString(property)) {
      if ((ref = property.toLowerCase()) === "1" || ref === "true") {
        property = true;
      } else if ((ref1 = property.toLowerCase()) === "0" || ref1 === "false") {
        property = false;
      } else {
        return;
      }
    }
    if (!_.isBoolean(property)) {

    }
  };

  AudioPlayer.prototype.getTime = function(showTime) {
    this._checkBoolean(showTime);
    this._showTime = showTime;
    if (showTime === true) {
      this.time = new Layer({
        backgroundColor: "transparent",
        name: "currentTime"
      });
      this.time.style = this.timeStyle;
      this.time.html = "0:00";
      return this.player.ontimeupdate = (function(_this) {
        return function() {
          return _this.time.html = _this.player.formatTime();
        };
      })(this);
    }
  };

  AudioPlayer.prototype.getTimeLeft = function(showTimeLeft) {
    this._checkBoolean(showTimeLeft);
    this._showTimeLeft = showTimeLeft;
    if (showTimeLeft === true) {
      this.timeLeft = new Layer({
        backgroundColor: "transparent",
        name: "timeLeft"
      });
      this.timeLeft.style = this.timeStyle;
      this.timeLeft.html = "-0:00";
      this.player.on("loadedmetadata", (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
        };
      })(this));
      return this.player.ontimeupdate = (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
        };
      })(this);
    }
  };

  AudioPlayer.prototype.setProgress = function(showProgress) {
    var isMoving, wasPlaying;
    this._checkBoolean(showProgress);
    this._showProgress = showProgress;
    if (this._showProgress === true) {
      this.progressBar = new SliderComponent({
        width: 200,
        height: 6,
        backgroundColor: "#eee",
        knobSize: 20,
        value: 0,
        min: 0
      });
      this.player.oncanplay = (function(_this) {
        return function() {
          return _this.progressBar.max = Math.round(_this.player.duration);
        };
      })(this);
      this.progressBar.knob.draggable.momentum = false;
      wasPlaying = isMoving = false;
      if (!this.player.paused) {
        wasPlaying = true;
      }
      this.progressBar.on("change:value", (function(_this) {
        return function() {
          _this.player.currentTime = _this.progressBar.value;
          if (_this.time && _this.timeLeft) {
            _this.time.html = _this.player.formatTime();
            return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
          }
        };
      })(this));
      this.progressBar.knob.on(Events.DragMove, (function(_this) {
        return function() {
          return isMoving = true;
        };
      })(this));
      this.progressBar.knob.on(Events.DragEnd, (function(_this) {
        return function(event) {
          var currentTime, duration;
          currentTime = Math.round(_this.player.currentTime);
          duration = Math.round(_this.player.duration);
          if (wasPlaying && currentTime !== duration) {
            _this.player.play();
            _this.controls.showPause();
          }
          if (currentTime === duration) {
            _this.player.pause();
            _this.controls.showPlay();
          }
          return isMoving = false;
        };
      })(this));
      return this.player.ontimeupdate = (function(_this) {
        return function() {
          if (!isMoving) {
            _this.progressBar.knob.midX = _this.progressBar.pointForValue(_this.player.currentTime);
            _this.progressBar.knob.draggable.isMoving = false;
          }
          if (_this.time && _this.timeLeft) {
            _this.time.html = _this.player.formatTime();
            return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
          }
        };
      })(this);
    }
  };

  AudioPlayer.prototype.setVolume = function(showVolume) {
    var base;
    this._checkBoolean(showVolume);
    if ((base = this.player).volume == null) {
      base.volume = 0.75;
    }
    this.volumeBar = new SliderComponent({
      width: 200,
      height: 6,
      backgroundColor: "#eee",
      knobSize: 20,
      min: 0,
      max: 1,
      value: this.player.volume
    });
    this.volumeBar.knob.draggable.momentum = false;
    this.volumeBar.on("change:width", (function(_this) {
      return function() {
        return _this.volumeBar.value = _this.player.volume;
      };
    })(this));
    return this.volumeBar.on("change:value", (function(_this) {
      return function() {
        return _this.player.volume = _this.volumeBar.value;
      };
    })(this));
  };

  return AudioPlayer;

})(Layer);


},{}],"videoplayer":[function(require,module,exports){
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.VideoPlayer = (function(superClass) {
  extend(VideoPlayer, superClass);

  function VideoPlayer(options) {
    var bindTo;
    if (options == null) {
      options = {};
    }
    this.setPauseButtonImage = bind(this.setPauseButtonImage, this);
    this.setPlayButtonImage = bind(this.setPlayButtonImage, this);
    this.setTimeTotal = bind(this.setTimeTotal, this);
    this.setTimeLeft = bind(this.setTimeLeft, this);
    this.controlheight = 80;
    this.playimage = 'images/play.png';
    this.pauseimage = 'images/pause.png';
    this.controlsArray = [];
    this.videowidth = options.fullscreen ? Screen.width : options.width;
    this.videoheight = options.fullscreen ? Screen.height : options.height;
    VideoPlayer.__super__.constructor.call(this, {
      width: this.videowidth,
      height: this.videoheight,
      backgroundColor: null
    });
    this.videolayer = new VideoLayer({
      width: this.videowidth,
      height: this.videoheight,
      superLayer: this,
      backgroundColor: '#000',
      name: "videolayer"
    });
    if (options.autoplay) {
      this.videolayer.player.autoplay = true;
    }
    if (options.muted) {
      this.videolayer.player.muted = true;
    }
    this.playcontrol = new Layer({
      width: this.controlheight,
      height: this.controlheight,
      superLayer: this.videolayer,
      backgroundColor: null,
      name: "playcontrol"
    });
    this.playcontrol.showPlay = (function(_this) {
      return function() {
        return _this.playcontrol.image = _this.playimage;
      };
    })(this);
    this.playcontrol.showPause = (function(_this) {
      return function() {
        return _this.playcontrol.image = _this.pauseimage;
      };
    })(this);
    this.playcontrol.showPlay();
    this.playcontrol.center();
    bindTo = options.constrainToButton ? this.playcontrol : this.videolayer;
    bindTo.on(Events.Click, (function(_this) {
      return function() {
        var i, layer, len, ref, results;
        if (_this.videolayer.player.paused) {
          _this.emit("controls:play");
          _this._currentlyPlaying = true;
          _this.videolayer.player.play();
          if (_this._shyPlayButton) {
            _this.fadePlayButton();
          }
          if (_this._shyControls) {
            return _this.fadeControls();
          }
        } else {
          _this.emit("controls:pause");
          _this._currentlyPlaying = false;
          _this.videolayer.player.pause();
          _this.playcontrol.animateStop();
          _this.playcontrol.opacity = 1;
          ref = _this.controlsArray;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            layer = ref[i];
            layer.animateStop();
            results.push(layer.opacity = 1);
          }
          return results;
        }
      };
    })(this));
    Events.wrap(this.videolayer.player).on("pause", (function(_this) {
      return function() {
        _this.emit("video:pause");
        if (!_this.isScrubbing) {
          return _this.playcontrol.showPlay();
        }
      };
    })(this));
    Events.wrap(this.videolayer.player).on("play", (function(_this) {
      return function() {
        _this.emit("video:play");
        return _this.playcontrol.showPause();
      };
    })(this));
    Events.wrap(this.videolayer.player).on("ended", (function(_this) {
      return function() {
        var i, layer, len, ref, results;
        _this.emit("video:ended");
        _this._currentlyPlaying = false;
        _this.videolayer.player.pause();
        _this.playcontrol.animateStop();
        _this.playcontrol.opacity = 1;
        ref = _this.controlsArray;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          layer = ref[i];
          layer.animateStop();
          results.push(layer.opacity = 1);
        }
        return results;
      };
    })(this));
    this.videolayer.video = options.video;
    this.timeStyle = {
      "font-size": "20px",
      "color": "#000"
    };
    this.videolayer.formatTime = function() {
      var min, sec;
      sec = Math.floor(this.player.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : '0' + sec;
      return min + ":" + sec;
    };
    this.videolayer.formatTimeLeft = function() {
      var min, sec;
      sec = Math.floor(this.player.duration) - Math.floor(this.player.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : '0' + sec;
      return min + ":" + sec;
    };
  }

  VideoPlayer.define('showProgress', {
    get: function() {
      return this._showProgress;
    },
    set: function(showProgress) {
      return this.setProgress(showProgress);
    }
  });

  VideoPlayer.define('showTimeElapsed', {
    get: function() {
      return this._showTimeElapsed;
    },
    set: function(showTimeElapsed) {
      return this.setTimeElapsed(showTimeElapsed);
    }
  });

  VideoPlayer.define('showTimeLeft', {
    get: function() {
      return this._showTimeLeft;
    },
    set: function(showTimeLeft) {
      return this.setTimeLeft(showTimeLeft);
    }
  });

  VideoPlayer.define('showTimeTotal', {
    get: function() {
      return this._showTimeTotal;
    },
    set: function(showTimeTotal) {
      return this.setTimeTotal(showTimeTotal);
    }
  });

  VideoPlayer.define('shyPlayButton', {
    get: function() {
      return this._shyPlayButton;
    },
    set: function(shyPlayButton) {
      return this.setShyPlayButton(shyPlayButton);
    }
  });

  VideoPlayer.define('shyControls', {
    get: function() {
      return this._shyControls;
    },
    set: function(shyControls) {
      return this.setShyControls(shyControls);
    }
  });

  VideoPlayer.define('playButtonImage', {
    get: function() {
      return this.playimage;
    },
    set: function(playButtonImage) {
      return this.setPlayButtonImage(playButtonImage);
    }
  });

  VideoPlayer.define('pauseButtonImage', {
    get: function() {
      return this.pauseimage;
    },
    set: function(pauseButtonImage) {
      return this.setPauseButtonImage(pauseButtonImage);
    }
  });

  VideoPlayer.define('isPlaying', {
    get: function() {
      return this._currentlyPlaying;
    }
  });

  VideoPlayer.define('player', {
    get: function() {
      return this.videolayer.player;
    }
  });

  VideoPlayer.prototype.setProgress = function(showProgress) {
    this._showProgress = showProgress;
    this.progressBar = new SliderComponent({
      width: 440,
      height: 10,
      knobSize: 40,
      backgroundColor: '#ccc',
      min: 0,
      value: 0,
      name: "progressBar"
    });
    this.controlsArray.push(this.progressBar);
    this.progressBar.knob.draggable.momentum = false;
    Events.wrap(this.videolayer.player).on("timeupdate", (function(_this) {
      return function() {
        return _this.progressBar.knob.midX = _this.progressBar.pointForValue(_this.videolayer.player.currentTime);
      };
    })(this));
    Events.wrap(this.videolayer.player).on("canplay", (function(_this) {
      return function() {
        return _this.progressBar.max = Math.round(_this.videolayer.player.duration);
      };
    })(this));
    this.progressBar.on("change:value", (function(_this) {
      return function() {
        if (_this.isPlaying) {
          return _this.videolayer.player.currentTime = _this.progressBar.value;
        }
      };
    })(this));
    this.progressBar.knob.on(Events.DragStart, (function(_this) {
      return function() {
        _this.isScrubbing = true;
        if (_this.isPlaying) {
          return _this.videolayer.player.pause();
        }
      };
    })(this));
    return this.progressBar.knob.on(Events.DragEnd, (function(_this) {
      return function() {
        _this.isScrubbing = false;
        _this.videolayer.player.currentTime = _this.progressBar.value;
        if (_this.isPlaying) {
          return _this.videolayer.player.play();
        }
      };
    })(this));
  };

  VideoPlayer.prototype.setShyPlayButton = function(shyPlayButton) {
    return this._shyPlayButton = shyPlayButton;
  };

  VideoPlayer.prototype.fadePlayButton = function() {
    return this.playcontrol.animate({
      properties: {
        opacity: 0
      },
      time: 2
    });
  };

  VideoPlayer.prototype.setShyControls = function(shyControls) {
    return this._shyControls = shyControls;
  };

  VideoPlayer.prototype.fadeControls = function() {
    var i, index, layer, len, ref, results;
    ref = this.controlsArray;
    results = [];
    for (index = i = 0, len = ref.length; i < len; index = ++i) {
      layer = ref[index];
      results.push(layer.animate({
        properties: {
          opacity: 0
        },
        time: 2
      }));
    }
    return results;
  };

  VideoPlayer.prototype.setTimeElapsed = function(showTimeElapsed) {
    this._showTimeElapsed = showTimeElapsed;
    if (showTimeElapsed === true) {
      this.timeElapsed = new Layer({
        backgroundColor: "transparent",
        name: "currentTime"
      });
      this.controlsArray.push(this.timeElapsed);
      this.timeElapsed.style = this.timeStyle;
      this.timeElapsed.html = "0:00";
      return Events.wrap(this.videolayer.player).on("timeupdate", (function(_this) {
        return function() {
          return _this.timeElapsed.html = _this.videolayer.formatTime();
        };
      })(this));
    }
  };

  VideoPlayer.prototype.setTimeLeft = function(showTimeLeft) {
    this._showTimeLeft = showTimeLeft;
    if (showTimeLeft === true) {
      this.timeLeft = new Layer({
        backgroundColor: "transparent",
        name: "timeLeft"
      });
      this.controlsArray.push(this.timeLeft);
      this.timeLeft.style = this.timeStyle;
      this.timeLeft.html = "-0:00";
      Events.wrap(this.videolayer.player).on("loadedmetadata", (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.videolayer.formatTimeLeft();
        };
      })(this));
      return Events.wrap(this.videolayer.player).on("timeupdate", (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.videolayer.formatTimeLeft();
        };
      })(this));
    }
  };

  VideoPlayer.prototype.setTimeTotal = function(showTimeTotal) {
    this._showTimeTotal = showTimeTotal;
    if (showTimeTotal === true) {
      this.timeTotal = new Layer({
        backgroundColor: "transparent",
        name: "timeTotal"
      });
      this.controlsArray.push(this.timeTotal);
      this.timeTotal.style = this.timeStyle;
      this.timeTotal.html = "0:00";
      return Events.wrap(this.videolayer.player).on("loadedmetadata", (function(_this) {
        return function() {
          return _this.timeTotal.html = _this.videolayer.formatTimeLeft();
        };
      })(this));
    }
  };

  VideoPlayer.prototype.setPlayButtonImage = function(image) {
    this.playimage = image;
    this.playcontrol.image = image;
    return this.playcontrol.showPlay = function() {
      return this.image = image;
    };
  };

  VideoPlayer.prototype.setPauseButtonImage = function(image) {
    this.pauseimage = image;
    return this.playcontrol.showPause = function() {
      return this.image = image;
    };
  };

  return VideoPlayer;

})(Layer);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL2ZhY2Vib29rLWlvcy1wbGF5ZXIuZnJhbWVyL21vZHVsZXMvYXVkaW8uY29mZmVlIiwiL1VzZXJzL2pheXN0YWtlbG9uL0Ryb3Bib3ggKFBlcnNvbmFsKS9Db2RlL0ZyYW1lci1BdWRpb1BsYXllci9leGFtcGxlcy9mYWNlYm9vay1pb3MtcGxheWVyLmZyYW1lci9tb2R1bGVzL3ZpZGVvcGxheWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUE7Ozs7QUFBTSxPQUFPLENBQUM7OztFQUVBLHFCQUFDLE9BQUQ7O01BQUMsVUFBUTs7OztNQUNyQixPQUFPLENBQUMsa0JBQW1COztJQUczQixJQUFDLENBQUEsTUFBRCxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLE9BQXZCO0lBQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQXFCLG9CQUFyQixFQUEyQyxNQUEzQztJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixTQUFyQixFQUFnQyxNQUFoQztJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQWQsR0FBc0I7SUFDdEIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBZCxHQUF1QjtJQUV2QixJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsR0FBYSxJQUFDLENBQUEsTUFBTSxDQUFDO0lBQ3JCLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUM7SUFFdEIsNkNBQU0sT0FBTjtJQUdBLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsS0FBQSxDQUNmO01BQUEsZUFBQSxFQUFpQixhQUFqQjtNQUNB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SUFBQyxDQUFBLEtBQUQsR0FBUztJQUFaO0VBSEw7O3dCQUtwQixtQkFBQSxHQUFxQixTQUFDLEtBQUQ7SUFDcEIsSUFBQyxDQUFBLFVBQUQsR0FBYztXQUNkLElBQUMsQ0FBQSxXQUFXLENBQUMsU0FBYixHQUF5QixTQUFBO2FBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUFaO0VBRkw7Ozs7R0FoUFkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgZXhwb3J0cy5BdWRpb1BsYXllciBleHRlbmRzIExheWVyXG5cblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdG9wdGlvbnMuYmFja2dyb3VuZENvbG9yID89IFwidHJhbnNwYXJlbnRcIlxuXG5cdFx0IyBEZWZpbmUgcGxheWVyXG5cdFx0QHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKVxuXHRcdEBwbGF5ZXIuc2V0QXR0cmlidXRlKFwid2Via2l0LXBsYXlzaW5saW5lXCIsIFwidHJ1ZVwiKVxuXHRcdEBwbGF5ZXIuc2V0QXR0cmlidXRlKFwicHJlbG9hZFwiLCBcImF1dG9cIilcblx0XHRAcGxheWVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCJcblx0XHRAcGxheWVyLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiXG5cblx0XHRAcGxheWVyLm9uID0gQHBsYXllci5hZGRFdmVudExpc3RlbmVyXG5cdFx0QHBsYXllci5vZmYgPSBAcGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXJcblxuXHRcdHN1cGVyIG9wdGlvbnNcblxuXHRcdCMgRGVmaW5lIGJhc2ljIGNvbnRyb2xzXG5cdFx0QGNvbnRyb2xzID0gbmV3IExheWVyXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0d2lkdGg6IDgwLCBoZWlnaHQ6IDgwLCBzdXBlckxheWVyOiBAXG5cdFx0XHRuYW1lOiBcImNvbnRyb2xzXCJcblxuXHRcdEBjb250cm9scy5zaG93UGxheSA9IC0+IEBpbWFnZSA9IFwiaW1hZ2VzL3BsYXkucG5nXCJcblx0XHRAY29udHJvbHMuc2hvd1BhdXNlID0gLT4gQGltYWdlID0gXCJpbWFnZXMvcGF1c2UucG5nXCJcblx0XHRAY29udHJvbHMuc2hvd1BsYXkoKVxuXHRcdEBjb250cm9scy5jZW50ZXIoKVxuXG5cdFx0QHRpbWVTdHlsZSA9IHsgXCJmb250LXNpemVcIjogXCIyMHB4XCIsIFwiY29sb3JcIjogXCIjMDAwXCIgfVxuXG5cdFx0IyBPbiBjbGlja1xuXHRcdEBvbiBFdmVudHMuQ2xpY2ssIC0+XG5cdFx0XHRjdXJyZW50VGltZSA9IE1hdGgucm91bmQoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdGR1cmF0aW9uID0gTWF0aC5yb3VuZChAcGxheWVyLmR1cmF0aW9uKVxuXG5cdFx0XHRpZiBAcGxheWVyLnBhdXNlZFxuXHRcdFx0XHRAcGxheWVyLnBsYXkoKVxuXHRcdFx0XHRAY29udHJvbHMuc2hvd1BhdXNlKClcblxuXHRcdFx0XHRpZiBjdXJyZW50VGltZSBpcyBkdXJhdGlvblxuXHRcdFx0XHRcdEBwbGF5ZXIuY3VycmVudFRpbWUgPSAwXG5cdFx0XHRcdFx0QHBsYXllci5wbGF5KClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHBsYXllci5wYXVzZSgpXG5cdFx0XHRcdEBjb250cm9scy5zaG93UGxheSgpXG5cblx0XHQjIE9uIGVuZCwgc3dpdGNoIHRvIHBsYXkgYnV0dG9uXG5cdFx0QHBsYXllci5vbnBsYXlpbmcgPSA9PiBAY29udHJvbHMuc2hvd1BhdXNlKClcblx0XHRAcGxheWVyLm9uZW5kZWQgPSA9PiBAY29udHJvbHMuc2hvd1BsYXkoKVxuXG5cdFx0IyBVdGlsc1xuXHRcdEBwbGF5ZXIuZm9ybWF0VGltZSA9IC0+XG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKEBjdXJyZW50VGltZSlcblx0XHRcdG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuXHRcdFx0c2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgJzAnICsgc2VjXG5cdFx0XHRyZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXHRcdEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQgPSAtPlxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihAZHVyYXRpb24pIC0gTWF0aC5mbG9vcihAY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblx0XHRAYXVkaW8gPSBvcHRpb25zLmF1ZGlvXG5cdFx0QF9lbGVtZW50LmFwcGVuZENoaWxkKEBwbGF5ZXIpXG5cblx0QGRlZmluZSBcImF1ZGlvXCIsXG5cdFx0Z2V0OiAtPiBAcGxheWVyLnNyY1xuXHRcdHNldDogKGF1ZGlvKSAtPlxuXHRcdFx0QHBsYXllci5zcmMgPSBhdWRpb1xuXHRcdFx0aWYgQHBsYXllci5jYW5QbGF5VHlwZShcImF1ZGlvL21wM1wiKSA9PSBcIlwiXG5cdFx0XHRcdHRocm93IEVycm9yIFwiTm8gc3VwcG9ydGVkIGF1ZGlvIGZpbGUgaW5jbHVkZWQuXCJcblxuXHRAZGVmaW5lIFwic2hvd1Byb2dyZXNzXCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dQcm9ncmVzc1xuXHRcdHNldDogKHNob3dQcm9ncmVzcykgLT4gQHNldFByb2dyZXNzKHNob3dQcm9ncmVzcywgZmFsc2UpXG5cblx0QGRlZmluZSBcInNob3dWb2x1bWVcIixcblx0XHRnZXQ6IC0+IEBfc2hvd1ZvbHVtZVxuXHRcdHNldDogKHNob3dWb2x1bWUpIC0+IEBzZXRWb2x1bWUoc2hvd1ZvbHVtZSwgZmFsc2UpXG5cblx0QGRlZmluZSBcInNob3dUaW1lXCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lXG5cdFx0c2V0OiAoc2hvd1RpbWUpIC0+IEBnZXRUaW1lKHNob3dUaW1lLCBmYWxzZSlcblxuXHRAZGVmaW5lIFwic2hvd1RpbWVMZWZ0XCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lTGVmdFxuXHRcdHNldDogKHNob3dUaW1lTGVmdCkgLT4gQGdldFRpbWVMZWZ0KHNob3dUaW1lTGVmdCwgZmFsc2UpXG5cblx0IyBDaGVja3MgYSBwcm9wZXJ0eSwgcmV0dXJucyBcInRydWVcIiBvciBcImZhbHNlXCJcblx0X2NoZWNrQm9vbGVhbjogKHByb3BlcnR5KSAtPlxuXHRcdGlmIF8uaXNTdHJpbmcocHJvcGVydHkpXG5cdFx0XHRpZiBwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpIGluIFtcIjFcIiwgXCJ0cnVlXCJdXG5cdFx0XHRcdHByb3BlcnR5ID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiBwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpIGluIFtcIjBcIiwgXCJmYWxzZVwiXVxuXHRcdFx0XHRwcm9wZXJ0eSA9IGZhbHNlXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVyblxuXHRcdGlmIG5vdCBfLmlzQm9vbGVhbihwcm9wZXJ0eSkgdGhlbiByZXR1cm5cblxuXHRnZXRUaW1lOiAoc2hvd1RpbWUpIC0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1RpbWUpXG5cdFx0QF9zaG93VGltZSA9IHNob3dUaW1lXG5cblx0XHRpZiBzaG93VGltZSBpcyB0cnVlXG5cdFx0XHRAdGltZSA9IG5ldyBMYXllclxuXHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRuYW1lOiBcImN1cnJlbnRUaW1lXCJcblxuXHRcdFx0QHRpbWUuc3R5bGUgPSBAdGltZVN0eWxlXG5cdFx0XHRAdGltZS5odG1sID0gXCIwOjAwXCJcblxuXHRcdFx0QHBsYXllci5vbnRpbWV1cGRhdGUgPSA9PlxuXHRcdFx0XHRAdGltZS5odG1sID0gQHBsYXllci5mb3JtYXRUaW1lKClcblxuXHRnZXRUaW1lTGVmdDogKHNob3dUaW1lTGVmdCkgPT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93VGltZUxlZnQpXG5cdFx0QF9zaG93VGltZUxlZnQgPSBzaG93VGltZUxlZnRcblxuXHRcdGlmIHNob3dUaW1lTGVmdCBpcyB0cnVlXG5cdFx0XHRAdGltZUxlZnQgPSBuZXcgTGF5ZXJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0bmFtZTogXCJ0aW1lTGVmdFwiXG5cblx0XHRcdEB0aW1lTGVmdC5zdHlsZSA9IEB0aW1lU3R5bGVcblxuXHRcdFx0IyBTZXQgdGltZUxlZnRcblx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItMDowMFwiXG5cdFx0XHRAcGxheWVyLm9uIFwibG9hZGVkbWV0YWRhdGFcIiwgPT5cblx0XHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi1cIiArIEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdFx0XHRAcGxheWVyLm9udGltZXVwZGF0ZSA9ID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRzZXRQcm9ncmVzczogKHNob3dQcm9ncmVzcykgLT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93UHJvZ3Jlc3MpXG5cblx0XHQjIFNldCBhcmd1bWVudCAoc2hvd1Byb2dyZXNzIGlzIGVpdGhlciB0cnVlIG9yIGZhbHNlKVxuXHRcdEBfc2hvd1Byb2dyZXNzID0gc2hvd1Byb2dyZXNzXG5cblx0XHRpZiBAX3Nob3dQcm9ncmVzcyBpcyB0cnVlXG5cblx0XHRcdCMgQ3JlYXRlIFByb2dyZXNzIEJhciArIERlZmF1bHRzXG5cdFx0XHRAcHJvZ3Jlc3NCYXIgPSBuZXcgU2xpZGVyQ29tcG9uZW50XG5cdFx0XHRcdHdpZHRoOiAyMDAsIGhlaWdodDogNiwgYmFja2dyb3VuZENvbG9yOiBcIiNlZWVcIlxuXHRcdFx0XHRrbm9iU2l6ZTogMjAsIHZhbHVlOiAwLCBtaW46IDBcblxuXHRcdFx0QHBsYXllci5vbmNhbnBsYXkgPSA9PiBAcHJvZ3Jlc3NCYXIubWF4ID0gTWF0aC5yb3VuZChAcGxheWVyLmR1cmF0aW9uKVxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2IuZHJhZ2dhYmxlLm1vbWVudHVtID0gZmFsc2VcblxuXHRcdFx0IyBDaGVjayBpZiB0aGUgcGxheWVyIHdhcyBwbGF5aW5nXG5cdFx0XHR3YXNQbGF5aW5nID0gaXNNb3ZpbmcgPSBmYWxzZVxuXHRcdFx0dW5sZXNzIEBwbGF5ZXIucGF1c2VkIHRoZW4gd2FzUGxheWluZyA9IHRydWVcblxuXHRcdFx0QHByb2dyZXNzQmFyLm9uIFwiY2hhbmdlOnZhbHVlXCIsID0+XG5cdFx0XHRcdEBwbGF5ZXIuY3VycmVudFRpbWUgPSBAcHJvZ3Jlc3NCYXIudmFsdWVcblxuXHRcdFx0XHRpZiBAdGltZSBhbmQgQHRpbWVMZWZ0XG5cdFx0XHRcdFx0QHRpbWUuaHRtbCA9IEBwbGF5ZXIuZm9ybWF0VGltZSgpXG5cdFx0XHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi1cIiArIEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ01vdmUsID0+IGlzTW92aW5nID0gdHJ1ZVxuXG5cdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ0VuZCwgKGV2ZW50KSA9PlxuXHRcdFx0XHRjdXJyZW50VGltZSA9IE1hdGgucm91bmQoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdFx0ZHVyYXRpb24gPSBNYXRoLnJvdW5kKEBwbGF5ZXIuZHVyYXRpb24pXG5cblx0XHRcdFx0aWYgd2FzUGxheWluZyBhbmQgY3VycmVudFRpbWUgaXNudCBkdXJhdGlvblxuXHRcdFx0XHRcdEBwbGF5ZXIucGxheSgpXG5cdFx0XHRcdFx0QGNvbnRyb2xzLnNob3dQYXVzZSgpXG5cblx0XHRcdFx0aWYgY3VycmVudFRpbWUgaXMgZHVyYXRpb25cblx0XHRcdFx0XHRAcGxheWVyLnBhdXNlKClcblx0XHRcdFx0XHRAY29udHJvbHMuc2hvd1BsYXkoKVxuXG5cdFx0XHRcdHJldHVybiBpc01vdmluZyA9IGZhbHNlXG5cblx0XHRcdCMgVXBkYXRlIFByb2dyZXNzXG5cdFx0XHRAcGxheWVyLm9udGltZXVwZGF0ZSA9ID0+XG5cdFx0XHRcdHVubGVzcyBpc01vdmluZ1xuXHRcdFx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLm1pZFggPSBAcHJvZ3Jlc3NCYXIucG9pbnRGb3JWYWx1ZShAcGxheWVyLmN1cnJlbnRUaW1lKVxuXHRcdFx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLmRyYWdnYWJsZS5pc01vdmluZyA9IGZhbHNlXG5cblx0XHRcdFx0aWYgQHRpbWUgYW5kIEB0aW1lTGVmdFxuXHRcdFx0XHRcdEB0aW1lLmh0bWwgPSBAcGxheWVyLmZvcm1hdFRpbWUoKVxuXHRcdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRzZXRWb2x1bWU6IChzaG93Vm9sdW1lKSAtPlxuXHRcdEBfY2hlY2tCb29sZWFuKHNob3dWb2x1bWUpXG5cblx0XHQjIFNldCBkZWZhdWx0IHRvIDc1JVxuXHRcdEBwbGF5ZXIudm9sdW1lID89IDAuNzVcblxuXHRcdEB2b2x1bWVCYXIgPSBuZXcgU2xpZGVyQ29tcG9uZW50XG5cdFx0XHR3aWR0aDogMjAwLCBoZWlnaHQ6IDZcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCIjZWVlXCJcblx0XHRcdGtub2JTaXplOiAyMFxuXHRcdFx0bWluOiAwLCBtYXg6IDFcblx0XHRcdHZhbHVlOiBAcGxheWVyLnZvbHVtZVxuXG5cdFx0QHZvbHVtZUJhci5rbm9iLmRyYWdnYWJsZS5tb21lbnR1bSA9IGZhbHNlXG5cblx0XHRAdm9sdW1lQmFyLm9uIFwiY2hhbmdlOndpZHRoXCIsID0+XG5cdFx0XHRAdm9sdW1lQmFyLnZhbHVlID0gQHBsYXllci52b2x1bWVcblxuXHRcdEB2b2x1bWVCYXIub24gXCJjaGFuZ2U6dmFsdWVcIiwgPT5cblx0XHRcdEBwbGF5ZXIudm9sdW1lID0gQHZvbHVtZUJhci52YWx1ZVxuIiwiY2xhc3MgZXhwb3J0cy5WaWRlb1BsYXllciBleHRlbmRzIExheWVyXG5cblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXG5cdFx0IyBwbGF5L3BhdXNlIGNvbnRyb2xcblx0XHRAY29udHJvbGhlaWdodCA9IDgwXG5cdFx0QHBsYXlpbWFnZSA9ICdpbWFnZXMvcGxheS5wbmcnXG5cdFx0QHBhdXNlaW1hZ2UgPSAnaW1hZ2VzL3BhdXNlLnBuZydcblxuXHRcdEBjb250cm9sc0FycmF5ID0gW11cblxuXHRcdEB2aWRlb3dpZHRoID0gaWYgb3B0aW9ucy5mdWxsc2NyZWVuIHRoZW4gU2NyZWVuLndpZHRoIGVsc2Ugb3B0aW9ucy53aWR0aFxuXHRcdEB2aWRlb2hlaWdodCA9IGlmIG9wdGlvbnMuZnVsbHNjcmVlbiB0aGVuIFNjcmVlbi5oZWlnaHQgZWxzZSBvcHRpb25zLmhlaWdodFxuXG5cdFx0IyBoZXJlJ3Mgb3VyIGNvbnRhaW5lciBsYXllclxuXHRcdHN1cGVyXG5cdFx0XHR3aWR0aDogQHZpZGVvd2lkdGhcblx0XHRcdGhlaWdodDogQHZpZGVvaGVpZ2h0XG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IG51bGxcblxuXHRcdCMgY3JlYXRlIHRoZSB2aWRlb2xheWVyXG5cdFx0QHZpZGVvbGF5ZXIgPSBuZXcgVmlkZW9MYXllclxuXHRcdFx0d2lkdGg6IEB2aWRlb3dpZHRoXG5cdFx0XHRoZWlnaHQ6IEB2aWRlb2hlaWdodFxuXHRcdFx0c3VwZXJMYXllcjogQFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiAnIzAwMCdcblx0XHRcdG5hbWU6IFwidmlkZW9sYXllclwiXG5cdFx0aWYgb3B0aW9ucy5hdXRvcGxheSB0aGVuIEB2aWRlb2xheWVyLnBsYXllci5hdXRvcGxheSA9IHRydWVcblx0XHRpZiBvcHRpb25zLm11dGVkIHRoZW4gQHZpZGVvbGF5ZXIucGxheWVyLm11dGVkID0gdHJ1ZVxuXG5cdFx0IyBjcmVhdGUgcGxheS9wYXVzZSBidXR0b25cblx0XHRAcGxheWNvbnRyb2wgPSBuZXcgTGF5ZXJcblx0XHRcdHdpZHRoOiBAY29udHJvbGhlaWdodFxuXHRcdFx0aGVpZ2h0OiBAY29udHJvbGhlaWdodFxuXHRcdFx0c3VwZXJMYXllcjogQHZpZGVvbGF5ZXJcblx0XHRcdGJhY2tncm91bmRDb2xvcjogbnVsbFxuXHRcdFx0bmFtZTogXCJwbGF5Y29udHJvbFwiXG5cblx0XHRAcGxheWNvbnRyb2wuc2hvd1BsYXkgPSA9PiBAcGxheWNvbnRyb2wuaW1hZ2UgPSBAcGxheWltYWdlXG5cdFx0QHBsYXljb250cm9sLnNob3dQYXVzZSA9ID0+IEBwbGF5Y29udHJvbC5pbWFnZSA9IEBwYXVzZWltYWdlXG5cdFx0QHBsYXljb250cm9sLnNob3dQbGF5KClcblx0XHRAcGxheWNvbnRyb2wuY2VudGVyKClcblxuXHRcdCMgcGxheS9wYXVzZSBidXR0b24gZXZlbnQgbGlzdGVuaW5nXG5cdFx0YmluZFRvID0gaWYgb3B0aW9ucy5jb25zdHJhaW5Ub0J1dHRvbiB0aGVuIEBwbGF5Y29udHJvbCBlbHNlIEB2aWRlb2xheWVyXG5cdFx0YmluZFRvLm9uIEV2ZW50cy5DbGljaywgPT5cblx0XHRcdGlmIEB2aWRlb2xheWVyLnBsYXllci5wYXVzZWRcblx0XHRcdFx0QGVtaXQgXCJjb250cm9sczpwbGF5XCJcblx0XHRcdFx0QF9jdXJyZW50bHlQbGF5aW5nID0gdHJ1ZVxuXHRcdFx0XHRAdmlkZW9sYXllci5wbGF5ZXIucGxheSgpXG5cdFx0XHRcdEBmYWRlUGxheUJ1dHRvbigpIGlmIEBfc2h5UGxheUJ1dHRvblxuXHRcdFx0XHRAZmFkZUNvbnRyb2xzKCkgaWYgQF9zaHlDb250cm9sc1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAZW1pdCBcImNvbnRyb2xzOnBhdXNlXCJcblx0XHRcdFx0QF9jdXJyZW50bHlQbGF5aW5nID0gZmFsc2Vcblx0XHRcdFx0QHZpZGVvbGF5ZXIucGxheWVyLnBhdXNlKClcblx0XHRcdFx0QHBsYXljb250cm9sLmFuaW1hdGVTdG9wKClcblx0XHRcdFx0QHBsYXljb250cm9sLm9wYWNpdHkgPSAxXG5cdFx0XHRcdGZvciBsYXllciBpbiBAY29udHJvbHNBcnJheVxuXHRcdFx0XHRcdGxheWVyLmFuaW1hdGVTdG9wKClcblx0XHRcdFx0XHRsYXllci5vcGFjaXR5ID0gMVxuXHRcdFx0XHRcblxuXHRcdCMgdmlkZW9sYXllciBldmVudCBsaXN0ZW5pbmdcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwicGF1c2VcIiwgPT5cblx0XHRcdEBlbWl0IFwidmlkZW86cGF1c2VcIlxuXHRcdFx0QHBsYXljb250cm9sLnNob3dQbGF5KCkgdW5sZXNzIEBpc1NjcnViYmluZ1xuXHRcdEV2ZW50cy53cmFwKEB2aWRlb2xheWVyLnBsYXllcikub24gXCJwbGF5XCIsID0+XG5cdFx0XHRAZW1pdCBcInZpZGVvOnBsYXlcIlxuXHRcdFx0QHBsYXljb250cm9sLnNob3dQYXVzZSgpXG5cdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcImVuZGVkXCIsID0+XG5cdFx0XHRAZW1pdCBcInZpZGVvOmVuZGVkXCJcblx0XHRcdEBfY3VycmVudGx5UGxheWluZyA9IGZhbHNlXG5cdFx0XHRAdmlkZW9sYXllci5wbGF5ZXIucGF1c2UoKVxuXHRcdFx0QHBsYXljb250cm9sLmFuaW1hdGVTdG9wKClcblx0XHRcdEBwbGF5Y29udHJvbC5vcGFjaXR5ID0gMVxuXHRcdFx0Zm9yIGxheWVyIGluIEBjb250cm9sc0FycmF5XG5cdFx0XHRcdGxheWVyLmFuaW1hdGVTdG9wKClcblx0XHRcdFx0bGF5ZXIub3BhY2l0eSA9IDFcblx0XHRAdmlkZW9sYXllci52aWRlbyA9IG9wdGlvbnMudmlkZW9cblxuXHRcdCMgdGltZSB0ZXh0IHN0eWxlc1xuXHRcdEB0aW1lU3R5bGUgPSB7IFwiZm9udC1zaXplXCI6IFwiMjBweFwiLCBcImNvbG9yXCI6IFwiIzAwMFwiIH1cblxuXHRcdCMgdGltZSB1dGlsaXRpZXNcblx0XHRAdmlkZW9sYXllci5mb3JtYXRUaW1lID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuXHRcdFx0c2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgJzAnICsgc2VjXG5cdFx0XHRyZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXHRcdEB2aWRlb2xheWVyLmZvcm1hdFRpbWVMZWZ0ID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5kdXJhdGlvbikgLSBNYXRoLmZsb29yKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblx0QGRlZmluZSAnc2hvd1Byb2dyZXNzJyxcblx0XHRnZXQ6IC0+IEBfc2hvd1Byb2dyZXNzXG5cdFx0c2V0OiAoc2hvd1Byb2dyZXNzKSAtPiBAc2V0UHJvZ3Jlc3Moc2hvd1Byb2dyZXNzKVxuXG5cdEBkZWZpbmUgJ3Nob3dUaW1lRWxhcHNlZCcsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lRWxhcHNlZFxuXHRcdHNldDogKHNob3dUaW1lRWxhcHNlZCkgLT4gQHNldFRpbWVFbGFwc2VkKHNob3dUaW1lRWxhcHNlZClcblxuXHRAZGVmaW5lICdzaG93VGltZUxlZnQnLFxuXHRcdGdldDogLT4gQF9zaG93VGltZUxlZnRcblx0XHRzZXQ6IChzaG93VGltZUxlZnQpIC0+IEBzZXRUaW1lTGVmdChzaG93VGltZUxlZnQpXG5cblx0QGRlZmluZSAnc2hvd1RpbWVUb3RhbCcsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lVG90YWxcblx0XHRzZXQ6IChzaG93VGltZVRvdGFsKSAtPiBAc2V0VGltZVRvdGFsKHNob3dUaW1lVG90YWwpXG5cblx0QGRlZmluZSAnc2h5UGxheUJ1dHRvbicsIFxuXHRcdGdldDogLT4gQF9zaHlQbGF5QnV0dG9uXG5cdFx0c2V0OiAoc2h5UGxheUJ1dHRvbikgLT4gQHNldFNoeVBsYXlCdXR0b24oc2h5UGxheUJ1dHRvbilcblxuXHRAZGVmaW5lICdzaHlDb250cm9scycsIFxuXHRcdGdldDogLT4gQF9zaHlDb250cm9sc1xuXHRcdHNldDogKHNoeUNvbnRyb2xzKSAtPiBAc2V0U2h5Q29udHJvbHMoc2h5Q29udHJvbHMpXG5cblx0QGRlZmluZSAncGxheUJ1dHRvbkltYWdlJyxcblx0XHRnZXQ6IC0+IEBwbGF5aW1hZ2Vcblx0XHRzZXQ6IChwbGF5QnV0dG9uSW1hZ2UpIC0+IEBzZXRQbGF5QnV0dG9uSW1hZ2UocGxheUJ1dHRvbkltYWdlKVxuXG5cdEBkZWZpbmUgJ3BhdXNlQnV0dG9uSW1hZ2UnLFxuXHRcdGdldDogLT4gQHBhdXNlaW1hZ2Vcblx0XHRzZXQ6IChwYXVzZUJ1dHRvbkltYWdlKSAtPiBAc2V0UGF1c2VCdXR0b25JbWFnZShwYXVzZUJ1dHRvbkltYWdlKVxuXG5cdEBkZWZpbmUgJ2lzUGxheWluZycsXG5cdFx0Z2V0OiAtPiBAX2N1cnJlbnRseVBsYXlpbmdcblxuXHRAZGVmaW5lICdwbGF5ZXInLFxuXHRcdGdldDogLT4gQHZpZGVvbGF5ZXIucGxheWVyXG5cblxuXHRzZXRQcm9ncmVzczogKHNob3dQcm9ncmVzcykgLT5cblx0XHRAX3Nob3dQcm9ncmVzcyA9IHNob3dQcm9ncmVzc1xuXG5cdFx0QHByb2dyZXNzQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0d2lkdGg6IDQ0MFxuXHRcdFx0aGVpZ2h0OiAxMFxuXHRcdFx0a25vYlNpemU6IDQwXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6ICcjY2NjJ1xuXHRcdFx0bWluOiAwXG5cdFx0XHR2YWx1ZTogMFxuXHRcdFx0bmFtZTogXCJwcm9ncmVzc0JhclwiXG5cdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAcHJvZ3Jlc3NCYXJcblxuXHRcdEBwcm9ncmVzc0Jhci5rbm9iLmRyYWdnYWJsZS5tb21lbnR1bSA9IGZhbHNlXG5cblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2IubWlkWCA9IEBwcm9ncmVzc0Jhci5wb2ludEZvclZhbHVlKEB2aWRlb2xheWVyLnBsYXllci5jdXJyZW50VGltZSlcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwiY2FucGxheVwiLCA9PlxuXHRcdFx0QHByb2dyZXNzQmFyLm1heCA9IE1hdGgucm91bmQoQHZpZGVvbGF5ZXIucGxheWVyLmR1cmF0aW9uKVxuXG5cdFx0IyBzY3J1YmJpbmcgcGVyZm9ybXMga2luZCBvZiBzaGl0dHkgb24gYW4gaVBob25lXG5cdFx0IyBhbmQgbm9uZSBvZiB0aGlzIGlzIHRoYXQgZ3JlYXQgd2l0aCB2ZXJ5IGxhcmdlIHZpZGVvc1xuXHRcdEBwcm9ncmVzc0Jhci5vbiBcImNoYW5nZTp2YWx1ZVwiLCA9PlxuXHRcdFx0aWYgQGlzUGxheWluZyB0aGVuIEB2aWRlb2xheWVyLnBsYXllci5jdXJyZW50VGltZSA9IEBwcm9ncmVzc0Jhci52YWx1ZVxuXHRcdEBwcm9ncmVzc0Jhci5rbm9iLm9uIEV2ZW50cy5EcmFnU3RhcnQsID0+XG5cdFx0XHRAaXNTY3J1YmJpbmcgPSB0cnVlXG5cdFx0XHRpZiBAaXNQbGF5aW5nIHRoZW4gQHZpZGVvbGF5ZXIucGxheWVyLnBhdXNlKClcblx0XHRAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ0VuZCwgPT5cblx0XHRcdEBpc1NjcnViYmluZyA9IGZhbHNlXG5cdFx0XHRAdmlkZW9sYXllci5wbGF5ZXIuY3VycmVudFRpbWUgPSBAcHJvZ3Jlc3NCYXIudmFsdWVcblx0XHRcdGlmIEBpc1BsYXlpbmcgdGhlbiBAdmlkZW9sYXllci5wbGF5ZXIucGxheSgpXG5cblx0c2V0U2h5UGxheUJ1dHRvbjogKHNoeVBsYXlCdXR0b24pIC0+XG5cdFx0QF9zaHlQbGF5QnV0dG9uID0gc2h5UGxheUJ1dHRvblxuXHRmYWRlUGxheUJ1dHRvbjogKCkgLT5cblx0XHRAcGxheWNvbnRyb2wuYW5pbWF0ZVxuXHRcdFx0cHJvcGVydGllczpcblx0XHRcdFx0b3BhY2l0eTogMFxuXHRcdFx0dGltZTogMlxuXG5cdHNldFNoeUNvbnRyb2xzOiAoc2h5Q29udHJvbHMpIC0+XG5cdFx0QF9zaHlDb250cm9scyA9IHNoeUNvbnRyb2xzXG5cdGZhZGVDb250cm9sczogKCkgLT5cblx0XHRmb3IgbGF5ZXIsIGluZGV4IGluIEBjb250cm9sc0FycmF5XG5cdFx0XHRsYXllci5hbmltYXRlXG5cdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0b3BhY2l0eTogMFxuXHRcdFx0XHR0aW1lOiAyXG5cdFx0XG5cdHNldFRpbWVFbGFwc2VkOiAoc2hvd1RpbWVFbGFwc2VkKSAtPlxuXHRcdEBfc2hvd1RpbWVFbGFwc2VkID0gc2hvd1RpbWVFbGFwc2VkXG5cblx0XHRpZiBzaG93VGltZUVsYXBzZWQgaXMgdHJ1ZVxuXHRcdFx0QHRpbWVFbGFwc2VkID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwiY3VycmVudFRpbWVcIlxuXHRcdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAdGltZUVsYXBzZWRcblxuXHRcdFx0QHRpbWVFbGFwc2VkLnN0eWxlID0gQHRpbWVTdHlsZVxuXHRcdFx0QHRpbWVFbGFwc2VkLmh0bWwgPSBcIjA6MDBcIlxuXG5cdFx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuXHRcdFx0XHRAdGltZUVsYXBzZWQuaHRtbCA9IEB2aWRlb2xheWVyLmZvcm1hdFRpbWUoKVxuXG5cdHNldFRpbWVMZWZ0OiAoc2hvd1RpbWVMZWZ0KSA9PlxuXHRcdEBfc2hvd1RpbWVMZWZ0ID0gc2hvd1RpbWVMZWZ0XG5cblx0XHRpZiBzaG93VGltZUxlZnQgaXMgdHJ1ZVxuXHRcdFx0QHRpbWVMZWZ0ID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwidGltZUxlZnRcIlxuXHRcdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAdGltZUxlZnRcblxuXHRcdFx0QHRpbWVMZWZ0LnN0eWxlID0gQHRpbWVTdHlsZVxuXG5cdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLTA6MDBcIlxuXHRcdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcImxvYWRlZG1ldGFkYXRhXCIsID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAdmlkZW9sYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0XHRcdEV2ZW50cy53cmFwKEB2aWRlb2xheWVyLnBsYXllcikub24gXCJ0aW1ldXBkYXRlXCIsID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAdmlkZW9sYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0c2V0VGltZVRvdGFsOiAoc2hvd1RpbWVUb3RhbCkgPT5cblx0XHRAX3Nob3dUaW1lVG90YWwgPSBzaG93VGltZVRvdGFsXG5cblx0XHRpZiBzaG93VGltZVRvdGFsIGlzIHRydWVcblx0XHRcdEB0aW1lVG90YWwgPSBuZXcgTGF5ZXJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0bmFtZTogXCJ0aW1lVG90YWxcIlxuXHRcdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAdGltZVRvdGFsXG5cblx0XHRcdEB0aW1lVG90YWwuc3R5bGUgPSBAdGltZVN0eWxlXG5cblx0XHRcdEB0aW1lVG90YWwuaHRtbCA9IFwiMDowMFwiXG5cdFx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwibG9hZGVkbWV0YWRhdGFcIiwgPT5cblx0XHRcdFx0QHRpbWVUb3RhbC5odG1sID0gQHZpZGVvbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdHNldFBsYXlCdXR0b25JbWFnZTogKGltYWdlKSA9PlxuXHRcdEBwbGF5aW1hZ2UgPSBpbWFnZVxuXHRcdEBwbGF5Y29udHJvbC5pbWFnZSA9IGltYWdlXG5cdFx0QHBsYXljb250cm9sLnNob3dQbGF5ID0gLT4gQGltYWdlID0gaW1hZ2VcblxuXHRzZXRQYXVzZUJ1dHRvbkltYWdlOiAoaW1hZ2UpID0+XG5cdFx0QHBhdXNlaW1hZ2UgPSBpbWFnZVxuXHRcdEBwbGF5Y29udHJvbC5zaG93UGF1c2UgPSAtPiBAaW1hZ2UgPSBpbWFnZVxuXG5cbiJdfQ==
