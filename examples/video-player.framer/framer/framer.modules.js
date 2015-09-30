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
    this.videoLayer = null;
    this.playButton = null;
    this.progessBar = null;
    this.timeElapsed = null;
    this.timeLeft = null;
    this.timeTotal = null;
    this._currentlyPlaying = null;
    this._shyPlayButton = null;
    this._shyControls = null;
    this._isScrubbing = null;
    this._showProgress = null;
    this._showTimeElapsed = null;
    this._showTimeLeft = null;
    this._showTimeTotal = null;
    this._controlsArray = [];
    this.playimage = "images/play.png";
    this.pauseimage = "images/pause.png";
    if (options.playButtonDimensions == null) {
      options.playButtonDimensions = 80;
    }
    if (options.backgroundColor == null) {
      options.backgroundColor = "#000";
    }
    if (options.width == null) {
      options.width = 480;
    }
    if (options.height == null) {
      options.height = 270;
    }
    if (options.fullscreen) {
      options.width = Screen.width;
      options.height = Screen.height;
    }
    VideoPlayer.__super__.constructor.call(this, {
      width: options.width,
      height: options.height,
      backgroundColor: null
    });
    this.videoLayer = new VideoLayer({
      width: options.width,
      height: options.height,
      superLayer: this,
      backgroundColor: options.backgroundColor,
      name: "videoLayer"
    });
    if (options.autoplay) {
      this.videoLayer.player.autoplay = true;
    }
    if (options.muted) {
      this.videoLayer.player.muted = true;
    }
    this.playButton = new Layer({
      width: options.playButtonDimensions,
      height: options.playButtonDimensions,
      superLayer: this.videoLayer,
      backgroundColor: null,
      name: "playButton"
    });
    this.playButton.showPlay = (function(_this) {
      return function() {
        return _this.playButton.image = _this.playimage;
      };
    })(this);
    this.playButton.showPause = (function(_this) {
      return function() {
        return _this.playButton.image = _this.pauseimage;
      };
    })(this);
    this.playButton.showPlay();
    this.playButton.center();
    bindTo = options.constrainToButton ? this.playButton : this.videoLayer;
    bindTo.on(Events.Click, (function(_this) {
      return function() {
        var i, layer, len, ref, results;
        if (_this.videoLayer.player.paused) {
          _this.emit("controls:play");
          _this._currentlyPlaying = true;
          _this.videoLayer.player.play();
          if (_this._shyPlayButton) {
            _this.fadePlayButton();
          }
          if (_this._shyControls) {
            return _this.fadeControls();
          }
        } else {
          _this.emit("controls:pause");
          _this._currentlyPlaying = false;
          _this.videoLayer.player.pause();
          _this.playButton.animateStop();
          _this.playButton.opacity = 1;
          ref = _this._controlsArray;
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
    Events.wrap(this.videoLayer.player).on("pause", (function(_this) {
      return function() {
        _this.emit("video:pause");
        if (!_this._isScrubbing) {
          return _this.playButton.showPlay();
        }
      };
    })(this));
    Events.wrap(this.videoLayer.player).on("play", (function(_this) {
      return function() {
        _this.emit("video:play");
        return _this.playButton.showPause();
      };
    })(this));
    Events.wrap(this.videoLayer.player).on("ended", (function(_this) {
      return function() {
        var i, layer, len, ref, results;
        _this.emit("video:ended");
        _this._currentlyPlaying = false;
        _this.videoLayer.player.pause();
        _this.playButton.animateStop();
        _this.playButton.opacity = 1;
        ref = _this._controlsArray;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          layer = ref[i];
          layer.animateStop();
          results.push(layer.opacity = 1);
        }
        return results;
      };
    })(this));
    this.videoLayer.video = options.video;
    this.timeStyle = {
      "font-size": "20px",
      "color": "#000"
    };
    this.videoLayer.formatTime = function() {
      var min, sec;
      sec = Math.floor(this.player.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : "0" + sec;
      return min + ":" + sec;
    };
    this.videoLayer.formatTimeLeft = function() {
      var min, sec;
      sec = Math.floor(this.player.duration) - Math.floor(this.player.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : "0" + sec;
      return min + ":" + sec;
    };
  }

  VideoPlayer.define("video", {
    get: function() {
      return this.videoLayer.player.src;
    },
    set: function(video) {
      return this.videoLayer.player.src = video;
    }
  });

  VideoPlayer.define("showProgress", {
    get: function() {
      return this._showProgress;
    },
    set: function(showProgress) {
      return this.setProgress(showProgress);
    }
  });

  VideoPlayer.define("showTimeElapsed", {
    get: function() {
      return this._showTimeElapsed;
    },
    set: function(showTimeElapsed) {
      return this.setTimeElapsed(showTimeElapsed);
    }
  });

  VideoPlayer.define("showTimeLeft", {
    get: function() {
      return this._showTimeLeft;
    },
    set: function(showTimeLeft) {
      return this.setTimeLeft(showTimeLeft);
    }
  });

  VideoPlayer.define("showTimeTotal", {
    get: function() {
      return this._showTimeTotal;
    },
    set: function(showTimeTotal) {
      return this.setTimeTotal(showTimeTotal);
    }
  });

  VideoPlayer.define("shyPlayButton", {
    get: function() {
      return this._shyPlayButton;
    },
    set: function(shyPlayButton) {
      return this.setShyPlayButton(shyPlayButton);
    }
  });

  VideoPlayer.define("shyControls", {
    get: function() {
      return this._shyControls;
    },
    set: function(shyControls) {
      return this.setShyControls(shyControls);
    }
  });

  VideoPlayer.define("playButtonImage", {
    get: function() {
      return this.playimage;
    },
    set: function(playButtonImage) {
      return this.setPlayButtonImage(playButtonImage);
    }
  });

  VideoPlayer.define("pauseButtonImage", {
    get: function() {
      return this.pauseimage;
    },
    set: function(pauseButtonImage) {
      return this.setPauseButtonImage(pauseButtonImage);
    }
  });

  VideoPlayer.define("player", {
    get: function() {
      return this.videoLayer.player;
    }
  });

  VideoPlayer.prototype.setProgress = function(showProgress) {
    this._showProgress = showProgress;
    this.progressBar = new SliderComponent({
      width: 440,
      height: 10,
      knobSize: 40,
      backgroundColor: "#ccc",
      min: 0,
      value: 0,
      name: "progressBar"
    });
    this._controlsArray.push(this.progressBar);
    this.progressBar.knob.draggable.momentum = false;
    Events.wrap(this.videoLayer.player).on("canplay", (function(_this) {
      return function() {
        return _this.progressBar.max = Math.round(_this.videoLayer.player.duration);
      };
    })(this));
    Events.wrap(this.videoLayer.player).on("timeupdate", (function(_this) {
      return function() {
        return _this.progressBar.knob.midX = _this.progressBar.pointForValue(_this.videoLayer.player.currentTime);
      };
    })(this));
    this.progressBar.on("change:value", (function(_this) {
      return function() {
        if (_this._currentlyPlaying) {
          return _this.videoLayer.player.currentTime = _this.progressBar.value;
        }
      };
    })(this));
    this.progressBar.knob.on(Events.DragStart, (function(_this) {
      return function() {
        _this._isScrubbing = true;
        if (_this._currentlyPlaying) {
          return _this.videoLayer.player.pause();
        }
      };
    })(this));
    return this.progressBar.knob.on(Events.DragEnd, (function(_this) {
      return function() {
        _this._isScrubbing = false;
        _this.videoLayer.player.currentTime = _this.progressBar.value;
        if (_this._currentlyPlaying) {
          return _this.videoLayer.player.play();
        }
      };
    })(this));
  };

  VideoPlayer.prototype.setShyPlayButton = function(shyPlayButton) {
    return this._shyPlayButton = shyPlayButton;
  };

  VideoPlayer.prototype.fadePlayButton = function() {
    return this.playButton.animate({
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
    ref = this._controlsArray;
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
      this._controlsArray.push(this.timeElapsed);
      this.timeElapsed.style = this.timeStyle;
      this.timeElapsed.html = "0:00";
      return Events.wrap(this.videoLayer.player).on("timeupdate", (function(_this) {
        return function() {
          return _this.timeElapsed.html = _this.videoLayer.formatTime();
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
      this._controlsArray.push(this.timeLeft);
      this.timeLeft.style = this.timeStyle;
      this.timeLeft.html = "-0:00";
      Events.wrap(this.videoLayer.player).on("loadedmetadata", (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.videoLayer.formatTimeLeft();
        };
      })(this));
      return Events.wrap(this.videoLayer.player).on("timeupdate", (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.videoLayer.formatTimeLeft();
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
      this._controlsArray.push(this.timeTotal);
      this.timeTotal.style = this.timeStyle;
      this.timeTotal.html = "0:00";
      return Events.wrap(this.videoLayer.player).on("loadedmetadata", (function(_this) {
        return function() {
          return _this.timeTotal.html = _this.videoLayer.formatTimeLeft();
        };
      })(this));
    }
  };

  VideoPlayer.prototype.setPlayButtonImage = function(image) {
    this.playimage = image;
    this.playButton.image = image;
    return this.playButton.showPlay = function() {
      return this.image = image;
    };
  };

  VideoPlayer.prototype.setPauseButtonImage = function(image) {
    this.pauseimage = image;
    return this.playButton.showPause = function() {
      return this.image = image;
    };
  };

  return VideoPlayer;

})(Layer);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL3ZpZGVvLXBsYXllci5mcmFtZXIvbW9kdWxlcy9hdWRpby5jb2ZmZWUiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL3ZpZGVvLXBsYXllci5mcmFtZXIvbW9kdWxlcy92aWRlb3BsYXllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOzs7O0FBQU0sT0FBTyxDQUFDOzs7RUFFQSxxQkFBQyxPQUFEOztNQUFDLFVBQVE7Ozs7TUFDckIsT0FBTyxDQUFDLGtCQUFtQjs7SUFHM0IsSUFBQyxDQUFBLE1BQUQsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtJQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixvQkFBckIsRUFBMkMsTUFBM0M7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsU0FBckIsRUFBZ0MsTUFBaEM7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFkLEdBQXNCO0lBQ3RCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWQsR0FBdUI7SUFFdkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNyQixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDO0lBRXRCLDZDQUFNLE9BQU47SUFHQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUEsQ0FDZjtNQUFBLGVBQUEsRUFBaUIsYUFBakI7TUFDQSxLQUFBLEVBQU8sRUFE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QUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQUMsQ0FBQSxTQUF0QjtNQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxHQUFtQixJQUFDLENBQUE7TUFFcEIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLEdBQWtCO2FBQ2xCLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUF4QixDQUErQixDQUFDLEVBQWhDLENBQW1DLGdCQUFuQyxFQUFxRCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ25ELEtBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxHQUFrQixLQUFDLENBQUEsVUFBVSxDQUFDLGNBQVosQ0FBQTtRQURpQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckQsRUFURjs7RUFIWTs7d0JBZ0JkLGtCQUFBLEdBQW9CLFNBQUMsS0FBRDtJQUNsQixJQUFDLENBQUEsU0FBRCxHQUFhO0lBQ2IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLEdBQW9CO1dBQ3BCLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixHQUF1QixTQUFBO2FBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUFaO0VBSEw7O3dCQU1wQixtQkFBQSxHQUFxQixTQUFDLEtBQUQ7SUFDbkIsSUFBQyxDQUFBLFVBQUQsR0FBYztXQUNkLElBQUMsQ0FBQSxVQUFVLENBQUMsU0FBWixHQUF3QixTQUFBO2FBQUcsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUFaO0VBRkw7Ozs7R0F0UlciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgZXhwb3J0cy5BdWRpb1BsYXllciBleHRlbmRzIExheWVyXG5cblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdG9wdGlvbnMuYmFja2dyb3VuZENvbG9yID89IFwidHJhbnNwYXJlbnRcIlxuXG5cdFx0IyBEZWZpbmUgcGxheWVyXG5cdFx0QHBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKVxuXHRcdEBwbGF5ZXIuc2V0QXR0cmlidXRlKFwid2Via2l0LXBsYXlzaW5saW5lXCIsIFwidHJ1ZVwiKVxuXHRcdEBwbGF5ZXIuc2V0QXR0cmlidXRlKFwicHJlbG9hZFwiLCBcImF1dG9cIilcblx0XHRAcGxheWVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCJcblx0XHRAcGxheWVyLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiXG5cblx0XHRAcGxheWVyLm9uID0gQHBsYXllci5hZGRFdmVudExpc3RlbmVyXG5cdFx0QHBsYXllci5vZmYgPSBAcGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXJcblxuXHRcdHN1cGVyIG9wdGlvbnNcblxuXHRcdCMgRGVmaW5lIGJhc2ljIGNvbnRyb2xzXG5cdFx0QGNvbnRyb2xzID0gbmV3IExheWVyXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0d2lkdGg6IDgwLCBoZWlnaHQ6IDgwLCBzdXBlckxheWVyOiBAXG5cdFx0XHRuYW1lOiBcImNvbnRyb2xzXCJcblxuXHRcdEBjb250cm9scy5zaG93UGxheSA9IC0+IEBpbWFnZSA9IFwiaW1hZ2VzL3BsYXkucG5nXCJcblx0XHRAY29udHJvbHMuc2hvd1BhdXNlID0gLT4gQGltYWdlID0gXCJpbWFnZXMvcGF1c2UucG5nXCJcblx0XHRAY29udHJvbHMuc2hvd1BsYXkoKVxuXHRcdEBjb250cm9scy5jZW50ZXIoKVxuXG5cdFx0QHRpbWVTdHlsZSA9IHsgXCJmb250LXNpemVcIjogXCIyMHB4XCIsIFwiY29sb3JcIjogXCIjMDAwXCIgfVxuXG5cdFx0IyBPbiBjbGlja1xuXHRcdEBvbiBFdmVudHMuQ2xpY2ssIC0+XG5cdFx0XHRjdXJyZW50VGltZSA9IE1hdGgucm91bmQoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdGR1cmF0aW9uID0gTWF0aC5yb3VuZChAcGxheWVyLmR1cmF0aW9uKVxuXG5cdFx0XHRpZiBAcGxheWVyLnBhdXNlZFxuXHRcdFx0XHRAcGxheWVyLnBsYXkoKVxuXHRcdFx0XHRAY29udHJvbHMuc2hvd1BhdXNlKClcblxuXHRcdFx0XHRpZiBjdXJyZW50VGltZSBpcyBkdXJhdGlvblxuXHRcdFx0XHRcdEBwbGF5ZXIuY3VycmVudFRpbWUgPSAwXG5cdFx0XHRcdFx0QHBsYXllci5wbGF5KClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QHBsYXllci5wYXVzZSgpXG5cdFx0XHRcdEBjb250cm9scy5zaG93UGxheSgpXG5cblx0XHQjIE9uIGVuZCwgc3dpdGNoIHRvIHBsYXkgYnV0dG9uXG5cdFx0QHBsYXllci5vbnBsYXlpbmcgPSA9PiBAY29udHJvbHMuc2hvd1BhdXNlKClcblx0XHRAcGxheWVyLm9uZW5kZWQgPSA9PiBAY29udHJvbHMuc2hvd1BsYXkoKVxuXG5cdFx0IyBVdGlsc1xuXHRcdEBwbGF5ZXIuZm9ybWF0VGltZSA9IC0+XG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKEBjdXJyZW50VGltZSlcblx0XHRcdG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuXHRcdFx0c2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgJzAnICsgc2VjXG5cdFx0XHRyZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXHRcdEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQgPSAtPlxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihAZHVyYXRpb24pIC0gTWF0aC5mbG9vcihAY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblx0XHRAYXVkaW8gPSBvcHRpb25zLmF1ZGlvXG5cdFx0QF9lbGVtZW50LmFwcGVuZENoaWxkKEBwbGF5ZXIpXG5cblx0QGRlZmluZSBcImF1ZGlvXCIsXG5cdFx0Z2V0OiAtPiBAcGxheWVyLnNyY1xuXHRcdHNldDogKGF1ZGlvKSAtPlxuXHRcdFx0QHBsYXllci5zcmMgPSBhdWRpb1xuXHRcdFx0aWYgQHBsYXllci5jYW5QbGF5VHlwZShcImF1ZGlvL21wM1wiKSA9PSBcIlwiXG5cdFx0XHRcdHRocm93IEVycm9yIFwiTm8gc3VwcG9ydGVkIGF1ZGlvIGZpbGUgaW5jbHVkZWQuXCJcblxuXHRAZGVmaW5lIFwic2hvd1Byb2dyZXNzXCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dQcm9ncmVzc1xuXHRcdHNldDogKHNob3dQcm9ncmVzcykgLT4gQHNldFByb2dyZXNzKHNob3dQcm9ncmVzcywgZmFsc2UpXG5cblx0QGRlZmluZSBcInNob3dWb2x1bWVcIixcblx0XHRnZXQ6IC0+IEBfc2hvd1ZvbHVtZVxuXHRcdHNldDogKHNob3dWb2x1bWUpIC0+IEBzZXRWb2x1bWUoc2hvd1ZvbHVtZSwgZmFsc2UpXG5cblx0QGRlZmluZSBcInNob3dUaW1lXCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lXG5cdFx0c2V0OiAoc2hvd1RpbWUpIC0+IEBnZXRUaW1lKHNob3dUaW1lLCBmYWxzZSlcblxuXHRAZGVmaW5lIFwic2hvd1RpbWVMZWZ0XCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lTGVmdFxuXHRcdHNldDogKHNob3dUaW1lTGVmdCkgLT4gQGdldFRpbWVMZWZ0KHNob3dUaW1lTGVmdCwgZmFsc2UpXG5cblx0IyBDaGVja3MgYSBwcm9wZXJ0eSwgcmV0dXJucyBcInRydWVcIiBvciBcImZhbHNlXCJcblx0X2NoZWNrQm9vbGVhbjogKHByb3BlcnR5KSAtPlxuXHRcdGlmIF8uaXNTdHJpbmcocHJvcGVydHkpXG5cdFx0XHRpZiBwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpIGluIFtcIjFcIiwgXCJ0cnVlXCJdXG5cdFx0XHRcdHByb3BlcnR5ID0gdHJ1ZVxuXHRcdFx0ZWxzZSBpZiBwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpIGluIFtcIjBcIiwgXCJmYWxzZVwiXVxuXHRcdFx0XHRwcm9wZXJ0eSA9IGZhbHNlXG5cdFx0XHRlbHNlXG5cdFx0XHRcdHJldHVyblxuXHRcdGlmIG5vdCBfLmlzQm9vbGVhbihwcm9wZXJ0eSkgdGhlbiByZXR1cm5cblxuXHRnZXRUaW1lOiAoc2hvd1RpbWUpIC0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1RpbWUpXG5cdFx0QF9zaG93VGltZSA9IHNob3dUaW1lXG5cblx0XHRpZiBzaG93VGltZSBpcyB0cnVlXG5cdFx0XHRAdGltZSA9IG5ldyBMYXllclxuXHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRuYW1lOiBcImN1cnJlbnRUaW1lXCJcblxuXHRcdFx0QHRpbWUuc3R5bGUgPSBAdGltZVN0eWxlXG5cdFx0XHRAdGltZS5odG1sID0gXCIwOjAwXCJcblxuXHRcdFx0QHBsYXllci5vbnRpbWV1cGRhdGUgPSA9PlxuXHRcdFx0XHRAdGltZS5odG1sID0gQHBsYXllci5mb3JtYXRUaW1lKClcblxuXHRnZXRUaW1lTGVmdDogKHNob3dUaW1lTGVmdCkgPT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93VGltZUxlZnQpXG5cdFx0QF9zaG93VGltZUxlZnQgPSBzaG93VGltZUxlZnRcblxuXHRcdGlmIHNob3dUaW1lTGVmdCBpcyB0cnVlXG5cdFx0XHRAdGltZUxlZnQgPSBuZXcgTGF5ZXJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0bmFtZTogXCJ0aW1lTGVmdFwiXG5cblx0XHRcdEB0aW1lTGVmdC5zdHlsZSA9IEB0aW1lU3R5bGVcblxuXHRcdFx0IyBTZXQgdGltZUxlZnRcblx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItMDowMFwiXG5cdFx0XHRAcGxheWVyLm9uIFwibG9hZGVkbWV0YWRhdGFcIiwgPT5cblx0XHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi1cIiArIEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdFx0XHRAcGxheWVyLm9udGltZXVwZGF0ZSA9ID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRzZXRQcm9ncmVzczogKHNob3dQcm9ncmVzcykgLT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93UHJvZ3Jlc3MpXG5cblx0XHQjIFNldCBhcmd1bWVudCAoc2hvd1Byb2dyZXNzIGlzIGVpdGhlciB0cnVlIG9yIGZhbHNlKVxuXHRcdEBfc2hvd1Byb2dyZXNzID0gc2hvd1Byb2dyZXNzXG5cblx0XHRpZiBAX3Nob3dQcm9ncmVzcyBpcyB0cnVlXG5cblx0XHRcdCMgQ3JlYXRlIFByb2dyZXNzIEJhciArIERlZmF1bHRzXG5cdFx0XHRAcHJvZ3Jlc3NCYXIgPSBuZXcgU2xpZGVyQ29tcG9uZW50XG5cdFx0XHRcdHdpZHRoOiAyMDAsIGhlaWdodDogNiwgYmFja2dyb3VuZENvbG9yOiBcIiNlZWVcIlxuXHRcdFx0XHRrbm9iU2l6ZTogMjAsIHZhbHVlOiAwLCBtaW46IDBcblxuXHRcdFx0QHBsYXllci5vbmNhbnBsYXkgPSA9PiBAcHJvZ3Jlc3NCYXIubWF4ID0gTWF0aC5yb3VuZChAcGxheWVyLmR1cmF0aW9uKVxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2IuZHJhZ2dhYmxlLm1vbWVudHVtID0gZmFsc2VcblxuXHRcdFx0IyBDaGVjayBpZiB0aGUgcGxheWVyIHdhcyBwbGF5aW5nXG5cdFx0XHR3YXNQbGF5aW5nID0gaXNNb3ZpbmcgPSBmYWxzZVxuXHRcdFx0dW5sZXNzIEBwbGF5ZXIucGF1c2VkIHRoZW4gd2FzUGxheWluZyA9IHRydWVcblxuXHRcdFx0QHByb2dyZXNzQmFyLm9uIFwiY2hhbmdlOnZhbHVlXCIsID0+XG5cdFx0XHRcdEBwbGF5ZXIuY3VycmVudFRpbWUgPSBAcHJvZ3Jlc3NCYXIudmFsdWVcblxuXHRcdFx0XHRpZiBAdGltZSBhbmQgQHRpbWVMZWZ0XG5cdFx0XHRcdFx0QHRpbWUuaHRtbCA9IEBwbGF5ZXIuZm9ybWF0VGltZSgpXG5cdFx0XHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi1cIiArIEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ01vdmUsID0+IGlzTW92aW5nID0gdHJ1ZVxuXG5cdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ0VuZCwgKGV2ZW50KSA9PlxuXHRcdFx0XHRjdXJyZW50VGltZSA9IE1hdGgucm91bmQoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdFx0ZHVyYXRpb24gPSBNYXRoLnJvdW5kKEBwbGF5ZXIuZHVyYXRpb24pXG5cblx0XHRcdFx0aWYgd2FzUGxheWluZyBhbmQgY3VycmVudFRpbWUgaXNudCBkdXJhdGlvblxuXHRcdFx0XHRcdEBwbGF5ZXIucGxheSgpXG5cdFx0XHRcdFx0QGNvbnRyb2xzLnNob3dQYXVzZSgpXG5cblx0XHRcdFx0aWYgY3VycmVudFRpbWUgaXMgZHVyYXRpb25cblx0XHRcdFx0XHRAcGxheWVyLnBhdXNlKClcblx0XHRcdFx0XHRAY29udHJvbHMuc2hvd1BsYXkoKVxuXG5cdFx0XHRcdHJldHVybiBpc01vdmluZyA9IGZhbHNlXG5cblx0XHRcdCMgVXBkYXRlIFByb2dyZXNzXG5cdFx0XHRAcGxheWVyLm9udGltZXVwZGF0ZSA9ID0+XG5cdFx0XHRcdHVubGVzcyBpc01vdmluZ1xuXHRcdFx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLm1pZFggPSBAcHJvZ3Jlc3NCYXIucG9pbnRGb3JWYWx1ZShAcGxheWVyLmN1cnJlbnRUaW1lKVxuXHRcdFx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLmRyYWdnYWJsZS5pc01vdmluZyA9IGZhbHNlXG5cblx0XHRcdFx0aWYgQHRpbWUgYW5kIEB0aW1lTGVmdFxuXHRcdFx0XHRcdEB0aW1lLmh0bWwgPSBAcGxheWVyLmZvcm1hdFRpbWUoKVxuXHRcdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRzZXRWb2x1bWU6IChzaG93Vm9sdW1lKSAtPlxuXHRcdEBfY2hlY2tCb29sZWFuKHNob3dWb2x1bWUpXG5cblx0XHQjIFNldCBkZWZhdWx0IHRvIDc1JVxuXHRcdEBwbGF5ZXIudm9sdW1lID89IDAuNzVcblxuXHRcdEB2b2x1bWVCYXIgPSBuZXcgU2xpZGVyQ29tcG9uZW50XG5cdFx0XHR3aWR0aDogMjAwLCBoZWlnaHQ6IDZcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCIjZWVlXCJcblx0XHRcdGtub2JTaXplOiAyMFxuXHRcdFx0bWluOiAwLCBtYXg6IDFcblx0XHRcdHZhbHVlOiBAcGxheWVyLnZvbHVtZVxuXG5cdFx0QHZvbHVtZUJhci5rbm9iLmRyYWdnYWJsZS5tb21lbnR1bSA9IGZhbHNlXG5cblx0XHRAdm9sdW1lQmFyLm9uIFwiY2hhbmdlOndpZHRoXCIsID0+XG5cdFx0XHRAdm9sdW1lQmFyLnZhbHVlID0gQHBsYXllci52b2x1bWVcblxuXHRcdEB2b2x1bWVCYXIub24gXCJjaGFuZ2U6dmFsdWVcIiwgPT5cblx0XHRcdEBwbGF5ZXIudm9sdW1lID0gQHZvbHVtZUJhci52YWx1ZVxuIiwiY2xhc3MgZXhwb3J0cy5WaWRlb1BsYXllciBleHRlbmRzIExheWVyXG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXG4gICAgIyBpbnN0YW5jZSB2YXJzIGZvciBsYXllcnMgd2Ugd2lsbCBjcmVhdGVcbiAgICBAdmlkZW9MYXllciA9IG51bGxcbiAgICBAcGxheUJ1dHRvbiA9IG51bGxcblxuICAgICMgaW5zdGFuY2UgdmFycyBmb3IgbGF5ZXJzIHdlIG1heSBjcmVhdGVcbiAgICBAcHJvZ2Vzc0JhciA9IG51bGxcbiAgICBAdGltZUVsYXBzZWQgPSBudWxsXG4gICAgQHRpbWVMZWZ0ID0gbnVsbFxuICAgIEB0aW1lVG90YWwgPSBudWxsXG5cbiAgICAjIGludGVybmFsIGluc3RhbmNlIHZhcnMgd2UgbWF5IGNyZWF0ZVxuICAgIEBfY3VycmVudGx5UGxheWluZyA9IG51bGxcbiAgICBAX3NoeVBsYXlCdXR0b24gPSBudWxsXG4gICAgQF9zaHlDb250cm9scyA9IG51bGxcbiAgICBAX2lzU2NydWJiaW5nID0gbnVsbFxuICAgIEBfc2hvd1Byb2dyZXNzID0gbnVsbFxuICAgIEBfc2hvd1RpbWVFbGFwc2VkID0gbnVsbFxuICAgIEBfc2hvd1RpbWVMZWZ0ID0gbnVsbFxuICAgIEBfc2hvd1RpbWVUb3RhbCA9IG51bGxcbiAgICBAX2NvbnRyb2xzQXJyYXkgPSBbXVxuXG4gICAgIyBwbGF5L3BhdXNlIGNvbnRyb2xcbiAgICBAcGxheWltYWdlID0gXCJpbWFnZXMvcGxheS5wbmdcIlxuICAgIEBwYXVzZWltYWdlID0gXCJpbWFnZXMvcGF1c2UucG5nXCJcblxuICAgIG9wdGlvbnMucGxheUJ1dHRvbkRpbWVuc2lvbnMgPz0gODBcbiAgICBvcHRpb25zLmJhY2tncm91bmRDb2xvciA/PSBcIiMwMDBcIlxuICAgIG9wdGlvbnMud2lkdGggPz0gNDgwXG4gICAgb3B0aW9ucy5oZWlnaHQgPz0gMjcwXG4gICAgaWYgb3B0aW9ucy5mdWxsc2NyZWVuXG4gICAgICBvcHRpb25zLndpZHRoID0gU2NyZWVuLndpZHRoXG4gICAgICBvcHRpb25zLmhlaWdodCA9IFNjcmVlbi5oZWlnaHRcblxuICAgICMgaGVyZSdzIG91ciBjb250YWluZXIgbGF5ZXJcbiAgICBzdXBlclxuICAgICAgd2lkdGg6IG9wdGlvbnMud2lkdGhcbiAgICAgIGhlaWdodDogb3B0aW9ucy5oZWlnaHRcbiAgICAgIGJhY2tncm91bmRDb2xvcjogbnVsbFxuXG4gICAgIyBjcmVhdGUgdGhlIHZpZGVvbGF5ZXJcbiAgICBAdmlkZW9MYXllciA9IG5ldyBWaWRlb0xheWVyXG4gICAgICB3aWR0aDogb3B0aW9ucy53aWR0aFxuICAgICAgaGVpZ2h0OiBvcHRpb25zLmhlaWdodFxuICAgICAgc3VwZXJMYXllcjogQFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBvcHRpb25zLmJhY2tncm91bmRDb2xvclxuICAgICAgbmFtZTogXCJ2aWRlb0xheWVyXCJcbiAgICBpZiBvcHRpb25zLmF1dG9wbGF5IHRoZW4gQHZpZGVvTGF5ZXIucGxheWVyLmF1dG9wbGF5ID0gdHJ1ZVxuICAgIGlmIG9wdGlvbnMubXV0ZWQgdGhlbiBAdmlkZW9MYXllci5wbGF5ZXIubXV0ZWQgPSB0cnVlXG5cbiAgICAjIGNyZWF0ZSBwbGF5L3BhdXNlIGJ1dHRvblxuICAgIEBwbGF5QnV0dG9uID0gbmV3IExheWVyXG4gICAgICB3aWR0aDogb3B0aW9ucy5wbGF5QnV0dG9uRGltZW5zaW9uc1xuICAgICAgaGVpZ2h0OiBvcHRpb25zLnBsYXlCdXR0b25EaW1lbnNpb25zXG4gICAgICBzdXBlckxheWVyOiBAdmlkZW9MYXllclxuICAgICAgYmFja2dyb3VuZENvbG9yOiBudWxsXG4gICAgICBuYW1lOiBcInBsYXlCdXR0b25cIlxuXG4gICAgIyBzZXQgdXAgdGhlIGRlZmF1bHQgcGxheWJ1dHRvblxuICAgIEBwbGF5QnV0dG9uLnNob3dQbGF5ID0gPT4gQHBsYXlCdXR0b24uaW1hZ2UgPSBAcGxheWltYWdlXG4gICAgQHBsYXlCdXR0b24uc2hvd1BhdXNlID0gPT4gQHBsYXlCdXR0b24uaW1hZ2UgPSBAcGF1c2VpbWFnZVxuICAgIEBwbGF5QnV0dG9uLnNob3dQbGF5KClcbiAgICBAcGxheUJ1dHRvbi5jZW50ZXIoKVxuXG4gICAgIyBsaXN0ZW4gZm9yIGV2ZW50cyBvbiB0aGUgd2hvbGUgdmlkZW9sYXllclxuICAgICMgb3IgYWx0ZXJuYXRlbHksIGp1c3Qgb24gdGhlIHBsYXkvcGF1c2UgYnV0dG9uXG4gICAgYmluZFRvID0gaWYgb3B0aW9ucy5jb25zdHJhaW5Ub0J1dHRvbiB0aGVuIEBwbGF5QnV0dG9uIGVsc2UgQHZpZGVvTGF5ZXJcbiAgICBiaW5kVG8ub24gRXZlbnRzLkNsaWNrLCA9PlxuICAgICAgaWYgQHZpZGVvTGF5ZXIucGxheWVyLnBhdXNlZFxuICAgICAgICBAZW1pdCBcImNvbnRyb2xzOnBsYXlcIlxuICAgICAgICBAX2N1cnJlbnRseVBsYXlpbmcgPSB0cnVlXG4gICAgICAgIEB2aWRlb0xheWVyLnBsYXllci5wbGF5KClcbiAgICAgICAgQGZhZGVQbGF5QnV0dG9uKCkgaWYgQF9zaHlQbGF5QnV0dG9uXG4gICAgICAgIEBmYWRlQ29udHJvbHMoKSBpZiBAX3NoeUNvbnRyb2xzXG4gICAgICBlbHNlXG4gICAgICAgIEBlbWl0IFwiY29udHJvbHM6cGF1c2VcIlxuICAgICAgICBAX2N1cnJlbnRseVBsYXlpbmcgPSBmYWxzZVxuICAgICAgICBAdmlkZW9MYXllci5wbGF5ZXIucGF1c2UoKVxuICAgICAgICBAcGxheUJ1dHRvbi5hbmltYXRlU3RvcCgpXG4gICAgICAgIEBwbGF5QnV0dG9uLm9wYWNpdHkgPSAxXG4gICAgICAgIGZvciBsYXllciBpbiBAX2NvbnRyb2xzQXJyYXlcbiAgICAgICAgICBsYXllci5hbmltYXRlU3RvcCgpXG4gICAgICAgICAgbGF5ZXIub3BhY2l0eSA9IDFcbiAgICAgICAgXG4gICAgIyBldmVudCBsaXN0ZW5pbmcgb24gdGhlIHZpZGVvTGF5ZXJcbiAgICBFdmVudHMud3JhcChAdmlkZW9MYXllci5wbGF5ZXIpLm9uIFwicGF1c2VcIiwgPT5cbiAgICAgIEBlbWl0IFwidmlkZW86cGF1c2VcIlxuICAgICAgQHBsYXlCdXR0b24uc2hvd1BsYXkoKSB1bmxlc3MgQF9pc1NjcnViYmluZ1xuICAgIEV2ZW50cy53cmFwKEB2aWRlb0xheWVyLnBsYXllcikub24gXCJwbGF5XCIsID0+XG4gICAgICBAZW1pdCBcInZpZGVvOnBsYXlcIlxuICAgICAgQHBsYXlCdXR0b24uc2hvd1BhdXNlKClcbiAgICBFdmVudHMud3JhcChAdmlkZW9MYXllci5wbGF5ZXIpLm9uIFwiZW5kZWRcIiwgPT5cbiAgICAgIEBlbWl0IFwidmlkZW86ZW5kZWRcIlxuICAgICAgQF9jdXJyZW50bHlQbGF5aW5nID0gZmFsc2VcbiAgICAgIEB2aWRlb0xheWVyLnBsYXllci5wYXVzZSgpXG4gICAgICBAcGxheUJ1dHRvbi5hbmltYXRlU3RvcCgpXG4gICAgICBAcGxheUJ1dHRvbi5vcGFjaXR5ID0gMVxuICAgICAgZm9yIGxheWVyIGluIEBfY29udHJvbHNBcnJheVxuICAgICAgICBsYXllci5hbmltYXRlU3RvcCgpXG4gICAgICAgIGxheWVyLm9wYWNpdHkgPSAxXG4gICAgQHZpZGVvTGF5ZXIudmlkZW8gPSBvcHRpb25zLnZpZGVvXG5cbiAgICAjIGRlZmF1bHQgdGltZSB0ZXh0IHN0eWxlc1xuICAgIEB0aW1lU3R5bGUgPSB7IFwiZm9udC1zaXplXCI6IFwiMjBweFwiLCBcImNvbG9yXCI6IFwiIzAwMFwiIH1cblxuICAgICMgdGltZSB1dGlsaXRpZXNcbiAgICBAdmlkZW9MYXllci5mb3JtYXRUaW1lID0gLT5cbiAgICAgIHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5jdXJyZW50VGltZSlcbiAgICAgIG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG4gICAgICBzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuICAgICAgc2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgXCIwXCIgKyBzZWNcbiAgICAgIHJldHVybiBcIiN7bWlufToje3NlY31cIlxuICAgIEB2aWRlb0xheWVyLmZvcm1hdFRpbWVMZWZ0ID0gLT5cbiAgICAgIHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5kdXJhdGlvbikgLSBNYXRoLmZsb29yKEBwbGF5ZXIuY3VycmVudFRpbWUpXG4gICAgICBtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuICAgICAgc2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcbiAgICAgIHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlIFwiMFwiICsgc2VjXG4gICAgICByZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXG4gICMgR2V0dGVycyBuJyBzZXR0ZXJzXG4gIEBkZWZpbmUgXCJ2aWRlb1wiLFxuICAgIGdldDogLT4gQHZpZGVvTGF5ZXIucGxheWVyLnNyY1xuICAgIHNldDogKHZpZGVvKSAtPlxuICAgICAgQHZpZGVvTGF5ZXIucGxheWVyLnNyYyA9IHZpZGVvXG5cbiAgQGRlZmluZSBcInNob3dQcm9ncmVzc1wiLFxuICAgIGdldDogLT4gQF9zaG93UHJvZ3Jlc3NcbiAgICBzZXQ6IChzaG93UHJvZ3Jlc3MpIC0+IEBzZXRQcm9ncmVzcyhzaG93UHJvZ3Jlc3MpXG5cbiAgQGRlZmluZSBcInNob3dUaW1lRWxhcHNlZFwiLFxuICAgIGdldDogLT4gQF9zaG93VGltZUVsYXBzZWRcbiAgICBzZXQ6IChzaG93VGltZUVsYXBzZWQpIC0+IEBzZXRUaW1lRWxhcHNlZChzaG93VGltZUVsYXBzZWQpXG5cbiAgQGRlZmluZSBcInNob3dUaW1lTGVmdFwiLFxuICAgIGdldDogLT4gQF9zaG93VGltZUxlZnRcbiAgICBzZXQ6IChzaG93VGltZUxlZnQpIC0+IEBzZXRUaW1lTGVmdChzaG93VGltZUxlZnQpXG5cbiAgQGRlZmluZSBcInNob3dUaW1lVG90YWxcIixcbiAgICBnZXQ6IC0+IEBfc2hvd1RpbWVUb3RhbFxuICAgIHNldDogKHNob3dUaW1lVG90YWwpIC0+IEBzZXRUaW1lVG90YWwoc2hvd1RpbWVUb3RhbClcblxuICBAZGVmaW5lIFwic2h5UGxheUJ1dHRvblwiLCBcbiAgICBnZXQ6IC0+IEBfc2h5UGxheUJ1dHRvblxuICAgIHNldDogKHNoeVBsYXlCdXR0b24pIC0+IEBzZXRTaHlQbGF5QnV0dG9uKHNoeVBsYXlCdXR0b24pXG5cbiAgQGRlZmluZSBcInNoeUNvbnRyb2xzXCIsIFxuICAgIGdldDogLT4gQF9zaHlDb250cm9sc1xuICAgIHNldDogKHNoeUNvbnRyb2xzKSAtPiBAc2V0U2h5Q29udHJvbHMoc2h5Q29udHJvbHMpXG5cbiAgQGRlZmluZSBcInBsYXlCdXR0b25JbWFnZVwiLFxuICAgIGdldDogLT4gQHBsYXlpbWFnZVxuICAgIHNldDogKHBsYXlCdXR0b25JbWFnZSkgLT4gQHNldFBsYXlCdXR0b25JbWFnZShwbGF5QnV0dG9uSW1hZ2UpXG5cbiAgQGRlZmluZSBcInBhdXNlQnV0dG9uSW1hZ2VcIixcbiAgICBnZXQ6IC0+IEBwYXVzZWltYWdlXG4gICAgc2V0OiAocGF1c2VCdXR0b25JbWFnZSkgLT4gQHNldFBhdXNlQnV0dG9uSW1hZ2UocGF1c2VCdXR0b25JbWFnZSlcblxuICBAZGVmaW5lIFwicGxheWVyXCIsXG4gICAgZ2V0OiAtPiBAdmlkZW9MYXllci5wbGF5ZXJcblxuXG4gICMgc2hvdyB0aGUgcHJvZ3Jlc3MgYmFyXG4gIHNldFByb2dyZXNzOiAoc2hvd1Byb2dyZXNzKSAtPlxuICAgIEBfc2hvd1Byb2dyZXNzID0gc2hvd1Byb2dyZXNzXG5cbiAgICAjIGNyZWF0ZSBhbmQgc2V0IHVwIHRoZSBwcm9ncmVzcyBiYXIgd2l0aCBkZWZhdWx0IHN0eWxlc1xuICAgIEBwcm9ncmVzc0JhciA9IG5ldyBTbGlkZXJDb21wb25lbnRcbiAgICAgIHdpZHRoOiA0NDBcbiAgICAgIGhlaWdodDogMTBcbiAgICAgIGtub2JTaXplOiA0MFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiNjY2NcIlxuICAgICAgbWluOiAwXG4gICAgICB2YWx1ZTogMFxuICAgICAgbmFtZTogXCJwcm9ncmVzc0JhclwiXG4gICAgQF9jb250cm9sc0FycmF5LnB1c2ggQHByb2dyZXNzQmFyXG4gICAgQHByb2dyZXNzQmFyLmtub2IuZHJhZ2dhYmxlLm1vbWVudHVtID0gZmFsc2VcblxuICAgICMgc2V0IGFuZCBhdXRvbWF0ZSBwcm9ncmVzcyBiYXJcbiAgICBFdmVudHMud3JhcChAdmlkZW9MYXllci5wbGF5ZXIpLm9uIFwiY2FucGxheVwiLCA9PlxuICAgICAgQHByb2dyZXNzQmFyLm1heCA9IE1hdGgucm91bmQoQHZpZGVvTGF5ZXIucGxheWVyLmR1cmF0aW9uKVxuICAgIEV2ZW50cy53cmFwKEB2aWRlb0xheWVyLnBsYXllcikub24gXCJ0aW1ldXBkYXRlXCIsID0+XG4gICAgICBAcHJvZ3Jlc3NCYXIua25vYi5taWRYID0gQHByb2dyZXNzQmFyLnBvaW50Rm9yVmFsdWUoQHZpZGVvTGF5ZXIucGxheWVyLmN1cnJlbnRUaW1lKVxuXG4gICAgIyBzZWVraW5nL3NjcnViYmluZyBldmVudHNcbiAgICAjIGFuZCBidHcgbm9uZSBvZiB0aGlzIHdvcmtzIHN1cGVyIGdyZWF0IHVzaW5nIHZlcnkgbGFyZ2UgdmlkZW9zXG4gICAgQHByb2dyZXNzQmFyLm9uIFwiY2hhbmdlOnZhbHVlXCIsID0+XG4gICAgICBpZiBAX2N1cnJlbnRseVBsYXlpbmcgdGhlbiBAdmlkZW9MYXllci5wbGF5ZXIuY3VycmVudFRpbWUgPSBAcHJvZ3Jlc3NCYXIudmFsdWVcbiAgICBAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ1N0YXJ0LCA9PlxuICAgICAgQF9pc1NjcnViYmluZyA9IHRydWVcbiAgICAgIGlmIEBfY3VycmVudGx5UGxheWluZyB0aGVuIEB2aWRlb0xheWVyLnBsYXllci5wYXVzZSgpXG4gICAgQHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdFbmQsID0+XG4gICAgICBAX2lzU2NydWJiaW5nID0gZmFsc2VcbiAgICAgIEB2aWRlb0xheWVyLnBsYXllci5jdXJyZW50VGltZSA9IEBwcm9ncmVzc0Jhci52YWx1ZVxuICAgICAgaWYgQF9jdXJyZW50bHlQbGF5aW5nIHRoZW4gQHZpZGVvTGF5ZXIucGxheWVyLnBsYXkoKVxuXG4gICMgc2V0IGZsYWcgZm9yIHNoeSBwbGF5IGJ1dHRvblxuICBzZXRTaHlQbGF5QnV0dG9uOiAoc2h5UGxheUJ1dHRvbikgLT5cbiAgICBAX3NoeVBsYXlCdXR0b24gPSBzaHlQbGF5QnV0dG9uXG4gICMgZmFkZSBvdXQgdGhlIHBsYXkgYnV0dG9uXG4gIGZhZGVQbGF5QnV0dG9uOiAoKSAtPlxuICAgIEBwbGF5QnV0dG9uLmFuaW1hdGVcbiAgICAgIHByb3BlcnRpZXM6XG4gICAgICAgIG9wYWNpdHk6IDBcbiAgICAgIHRpbWU6IDJcblxuICAjIHNldCBmbGFnIGZvciBzaHkgY29udHJvbHNcbiAgc2V0U2h5Q29udHJvbHM6IChzaHlDb250cm9scykgLT5cbiAgICBAX3NoeUNvbnRyb2xzID0gc2h5Q29udHJvbHNcbiAgIyBzaG9ydGN1dCB0byBmYWRlIG91dCBhbGwgdGhlIGNvbnRyb2xzXG4gIGZhZGVDb250cm9sczogKCkgLT5cbiAgICBmb3IgbGF5ZXIsIGluZGV4IGluIEBfY29udHJvbHNBcnJheVxuICAgICAgbGF5ZXIuYW5pbWF0ZVxuICAgICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgdGltZTogMlxuICAgIFxuICAjIHNob3cgYW5kIGluY3JlbWVudCBlbGFwc2VkIHRpbWVcbiAgc2V0VGltZUVsYXBzZWQ6IChzaG93VGltZUVsYXBzZWQpIC0+XG4gICAgQF9zaG93VGltZUVsYXBzZWQgPSBzaG93VGltZUVsYXBzZWRcblxuICAgIGlmIHNob3dUaW1lRWxhcHNlZCBpcyB0cnVlXG4gICAgICBAdGltZUVsYXBzZWQgPSBuZXcgTGF5ZXJcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcbiAgICAgICAgbmFtZTogXCJjdXJyZW50VGltZVwiXG4gICAgICBAX2NvbnRyb2xzQXJyYXkucHVzaCBAdGltZUVsYXBzZWRcblxuICAgICAgQHRpbWVFbGFwc2VkLnN0eWxlID0gQHRpbWVTdHlsZVxuICAgICAgQHRpbWVFbGFwc2VkLmh0bWwgPSBcIjA6MDBcIlxuXG4gICAgICBFdmVudHMud3JhcChAdmlkZW9MYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuICAgICAgICBAdGltZUVsYXBzZWQuaHRtbCA9IEB2aWRlb0xheWVyLmZvcm1hdFRpbWUoKVxuXG4gICMgc2hvdyBhbmQgZGVjcmVtZW50IHRpbWUgcmVtYWluaW5nXG4gIHNldFRpbWVMZWZ0OiAoc2hvd1RpbWVMZWZ0KSA9PlxuICAgIEBfc2hvd1RpbWVMZWZ0ID0gc2hvd1RpbWVMZWZ0XG5cbiAgICBpZiBzaG93VGltZUxlZnQgaXMgdHJ1ZVxuICAgICAgQHRpbWVMZWZ0ID0gbmV3IExheWVyXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG4gICAgICAgIG5hbWU6IFwidGltZUxlZnRcIlxuICAgICAgQF9jb250cm9sc0FycmF5LnB1c2ggQHRpbWVMZWZ0XG5cbiAgICAgIEB0aW1lTGVmdC5zdHlsZSA9IEB0aW1lU3R5bGVcblxuICAgICAgQHRpbWVMZWZ0Lmh0bWwgPSBcIi0wOjAwXCJcbiAgICAgIEV2ZW50cy53cmFwKEB2aWRlb0xheWVyLnBsYXllcikub24gXCJsb2FkZWRtZXRhZGF0YVwiLCA9PlxuICAgICAgICBAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHZpZGVvTGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG4gICAgICBFdmVudHMud3JhcChAdmlkZW9MYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuICAgICAgICBAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHZpZGVvTGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG4gICMgc2hvdyBhIHN0YXRpYyB0aW1lc3RhbXAgZm9yIHRvdGFsIGR1cmF0aW9uXG4gIHNldFRpbWVUb3RhbDogKHNob3dUaW1lVG90YWwpID0+XG4gICAgQF9zaG93VGltZVRvdGFsID0gc2hvd1RpbWVUb3RhbFxuXG4gICAgaWYgc2hvd1RpbWVUb3RhbCBpcyB0cnVlXG4gICAgICBAdGltZVRvdGFsID0gbmV3IExheWVyXG4gICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG4gICAgICAgIG5hbWU6IFwidGltZVRvdGFsXCJcbiAgICAgIEBfY29udHJvbHNBcnJheS5wdXNoIEB0aW1lVG90YWxcblxuICAgICAgQHRpbWVUb3RhbC5zdHlsZSA9IEB0aW1lU3R5bGVcblxuICAgICAgQHRpbWVUb3RhbC5odG1sID0gXCIwOjAwXCJcbiAgICAgIEV2ZW50cy53cmFwKEB2aWRlb0xheWVyLnBsYXllcikub24gXCJsb2FkZWRtZXRhZGF0YVwiLCA9PlxuICAgICAgICBAdGltZVRvdGFsLmh0bWwgPSBAdmlkZW9MYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cbiAgIyBzZXQgYSBuZXcgaW1hZ2UgZm9yIHRoZSBwbGF5IGJ1dHRvblxuICBzZXRQbGF5QnV0dG9uSW1hZ2U6IChpbWFnZSkgPT5cbiAgICBAcGxheWltYWdlID0gaW1hZ2VcbiAgICBAcGxheUJ1dHRvbi5pbWFnZSA9IGltYWdlXG4gICAgQHBsYXlCdXR0b24uc2hvd1BsYXkgPSAtPiBAaW1hZ2UgPSBpbWFnZVxuXG4gICMgc2V0IGEgbmV3IGltYWdlIGZvciB0aGUgcGF1c2UgYnV0dG9uXG4gIHNldFBhdXNlQnV0dG9uSW1hZ2U6IChpbWFnZSkgPT5cbiAgICBAcGF1c2VpbWFnZSA9IGltYWdlXG4gICAgQHBsYXlCdXR0b24uc2hvd1BhdXNlID0gLT4gQGltYWdlID0gaW1hZ2UiXX0=
