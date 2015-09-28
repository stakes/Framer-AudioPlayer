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
    if (options == null) {
      options = {};
    }
    this.setTimeTotal = bind(this.setTimeTotal, this);
    this.setTimeLeft = bind(this.setTimeLeft, this);
    this.controlheight = 80;
    this.controlsArray = [];
    this.controlsAnimations = [];
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
      backgroundColor: '#000'
    });
    this.playcontrol = new Layer({
      width: this.controlheight,
      height: this.controlheight,
      superLayer: this.videolayer,
      backgroundColor: null
    });
    this.playcontrol.y = this.videolayer.height;
    this.playcontrol.showPlay = function() {
      return this.image = 'images/play.png';
    };
    this.playcontrol.showPause = function() {
      return this.image = 'images/pause.png';
    };
    this.playcontrol.showPlay();
    this.playcontrol.center();
    this.videolayer.on(Events.Click, (function(_this) {
      return function() {
        var animation, i, j, layer, len, len1, ref, ref1;
        if (_this.videolayer.player.paused) {
          _this._currentlyPlaying = true;
          _this.videolayer.player.play();
          if (_this._shyPlayButton) {
            _this.fadePlayButton();
          }
          if (_this._shyControls) {
            return _this.fadeControls();
          }
        } else {
          _this._currentlyPlaying = false;
          _this.videolayer.player.pause();
          if (_this.fadeButtonAnimation) {
            _this.fadeButtonAnimation.stop();
          }
          ref = _this.controlsAnimations;
          for (i = 0, len = ref.length; i < len; i++) {
            animation = ref[i];
            animation.stop();
          }
          ref1 = _this.controlsArray;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            layer = ref1[j];
            layer.opacity = 1;
          }
          return _this.playcontrol.opacity = 1;
        }
      };
    })(this));
    Events.wrap(this.videolayer.player).on("pause", (function(_this) {
      return function() {
        if (!_this.isScrubbing) {
          return _this.playcontrol.showPlay();
        }
      };
    })(this));
    Events.wrap(this.videolayer.player).on("play", (function(_this) {
      return function() {
        return _this.playcontrol.showPause();
      };
    })(this));
    Events.wrap(this.videolayer.player).on("ended", (function(_this) {
      return function() {
        var animation, i, j, layer, len, len1, ref, ref1, results;
        _this._currentlyPlaying = false;
        _this.videolayer.player.pause();
        if (_this.fadeButtonAnimation) {
          _this.fadeButtonAnimation.stop();
        }
        _this.playcontrol.opacity = 1;
        ref = _this.controlsAnimations;
        for (i = 0, len = ref.length; i < len; i++) {
          animation = ref[i];
          animation.stop();
        }
        ref1 = _this.controlsArray;
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          layer = ref1[j];
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

  VideoPlayer.define('isPlaying', {
    get: function() {
      return this._currentlyPlaying;
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
      value: 0
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
    this.fadeButtonAnimation = new Animation({
      layer: this.playcontrol,
      properties: {
        opacity: 0
      },
      time: 2
    });
    return this.fadeButtonAnimation.start();
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
      this.controlsAnimations[index] = new Animation({
        layer: layer,
        properties: {
          opacity: 0
        },
        time: 2
      });
      results.push(this.controlsAnimations[index].start());
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

  return VideoPlayer;

})(Layer);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL3ZpZGVvLXBsYXllci5mcmFtZXIvbW9kdWxlcy9hdWRpby5jb2ZmZWUiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL3ZpZGVvLXBsYXllci5mcmFtZXIvbW9kdWxlcy92aWRlb3BsYXllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOzs7O0FBQU0sT0FBTyxDQUFDOzs7RUFFQSxxQkFBQyxPQUFEOztNQUFDLFVBQVE7Ozs7TUFDckIsT0FBTyxDQUFDLGtCQUFtQjs7SUFHM0IsSUFBQyxDQUFBLE1BQUQsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtJQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixvQkFBckIsRUFBMkMsTUFBM0M7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsU0FBckIsRUFBZ0MsTUFBaEM7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFkLEdBQXNCO0lBQ3RCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWQsR0FBdUI7SUFFdkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNyQixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDO0lBRXRCLDZDQUFNLE9BQU47SUFHQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUEsQ0FDZjtNQUFBLGVBQUEsRUFBaUIsYUFBakI7TUFDQSxLQUFBLEVBQU8sRUFE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S0FBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLEdBQWtCLEtBQUMsQ0FBQSxVQUFVLENBQUMsY0FBWixDQUFBO1FBRGtDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyRCxFQVREOztFQUhhOzs7O0dBM01tQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBleHBvcnRzLkF1ZGlvUGxheWVyIGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cdFx0b3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgPz0gXCJ0cmFuc3BhcmVudFwiXG5cblx0XHQjIERlZmluZSBwbGF5ZXJcblx0XHRAcGxheWVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImF1ZGlvXCIpXG5cdFx0QHBsYXllci5zZXRBdHRyaWJ1dGUoXCJ3ZWJraXQtcGxheXNpbmxpbmVcIiwgXCJ0cnVlXCIpXG5cdFx0QHBsYXllci5zZXRBdHRyaWJ1dGUoXCJwcmVsb2FkXCIsIFwiYXV0b1wiKVxuXHRcdEBwbGF5ZXIuc3R5bGUud2lkdGggPSBcIjEwMCVcIlxuXHRcdEBwbGF5ZXIuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCJcblxuXHRcdEBwbGF5ZXIub24gPSBAcGxheWVyLmFkZEV2ZW50TGlzdGVuZXJcblx0XHRAcGxheWVyLm9mZiA9IEBwbGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lclxuXG5cdFx0c3VwZXIgb3B0aW9uc1xuXG5cdFx0IyBEZWZpbmUgYmFzaWMgY29udHJvbHNcblx0XHRAY29udHJvbHMgPSBuZXcgTGF5ZXJcblx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHR3aWR0aDogODAsIGhlaWdodDogODAsIHN1cGVyTGF5ZXI6IEBcblx0XHRcdG5hbWU6IFwiY29udHJvbHNcIlxuXG5cdFx0QGNvbnRyb2xzLnNob3dQbGF5ID0gLT4gQGltYWdlID0gXCJpbWFnZXMvcGxheS5wbmdcIlxuXHRcdEBjb250cm9scy5zaG93UGF1c2UgPSAtPiBAaW1hZ2UgPSBcImltYWdlcy9wYXVzZS5wbmdcIlxuXHRcdEBjb250cm9scy5zaG93UGxheSgpXG5cdFx0QGNvbnRyb2xzLmNlbnRlcigpXG5cblx0XHRAdGltZVN0eWxlID0geyBcImZvbnQtc2l6ZVwiOiBcIjIwcHhcIiwgXCJjb2xvclwiOiBcIiMwMDBcIiB9XG5cblx0XHQjIE9uIGNsaWNrXG5cdFx0QG9uIEV2ZW50cy5DbGljaywgLT5cblx0XHRcdGN1cnJlbnRUaW1lID0gTWF0aC5yb3VuZChAcGxheWVyLmN1cnJlbnRUaW1lKVxuXHRcdFx0ZHVyYXRpb24gPSBNYXRoLnJvdW5kKEBwbGF5ZXIuZHVyYXRpb24pXG5cblx0XHRcdGlmIEBwbGF5ZXIucGF1c2VkXG5cdFx0XHRcdEBwbGF5ZXIucGxheSgpXG5cdFx0XHRcdEBjb250cm9scy5zaG93UGF1c2UoKVxuXG5cdFx0XHRcdGlmIGN1cnJlbnRUaW1lIGlzIGR1cmF0aW9uXG5cdFx0XHRcdFx0QHBsYXllci5jdXJyZW50VGltZSA9IDBcblx0XHRcdFx0XHRAcGxheWVyLnBsYXkoKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAcGxheWVyLnBhdXNlKClcblx0XHRcdFx0QGNvbnRyb2xzLnNob3dQbGF5KClcblxuXHRcdCMgT24gZW5kLCBzd2l0Y2ggdG8gcGxheSBidXR0b25cblx0XHRAcGxheWVyLm9ucGxheWluZyA9ID0+IEBjb250cm9scy5zaG93UGF1c2UoKVxuXHRcdEBwbGF5ZXIub25lbmRlZCA9ID0+IEBjb250cm9scy5zaG93UGxheSgpXG5cblx0XHQjIFV0aWxzXG5cdFx0QHBsYXllci5mb3JtYXRUaW1lID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQGN1cnJlbnRUaW1lKVxuXHRcdFx0bWluID0gTWF0aC5mbG9vcihzZWMgLyA2MClcblx0XHRcdHNlYyA9IE1hdGguZmxvb3Ioc2VjICUgNjApXG5cdFx0XHRzZWMgPSBpZiBzZWMgPj0gMTAgdGhlbiBzZWMgZWxzZSAnMCcgKyBzZWNcblx0XHRcdHJldHVybiBcIiN7bWlufToje3NlY31cIlxuXG5cdFx0QHBsYXllci5mb3JtYXRUaW1lTGVmdCA9IC0+XG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKEBkdXJhdGlvbikgLSBNYXRoLmZsb29yKEBjdXJyZW50VGltZSlcblx0XHRcdG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuXHRcdFx0c2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgJzAnICsgc2VjXG5cdFx0XHRyZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXHRcdEBhdWRpbyA9IG9wdGlvbnMuYXVkaW9cblx0XHRAX2VsZW1lbnQuYXBwZW5kQ2hpbGQoQHBsYXllcilcblxuXHRAZGVmaW5lIFwiYXVkaW9cIixcblx0XHRnZXQ6IC0+IEBwbGF5ZXIuc3JjXG5cdFx0c2V0OiAoYXVkaW8pIC0+XG5cdFx0XHRAcGxheWVyLnNyYyA9IGF1ZGlvXG5cdFx0XHRpZiBAcGxheWVyLmNhblBsYXlUeXBlKFwiYXVkaW8vbXAzXCIpID09IFwiXCJcblx0XHRcdFx0dGhyb3cgRXJyb3IgXCJObyBzdXBwb3J0ZWQgYXVkaW8gZmlsZSBpbmNsdWRlZC5cIlxuXG5cdEBkZWZpbmUgXCJzaG93UHJvZ3Jlc3NcIixcblx0XHRnZXQ6IC0+IEBfc2hvd1Byb2dyZXNzXG5cdFx0c2V0OiAoc2hvd1Byb2dyZXNzKSAtPiBAc2V0UHJvZ3Jlc3Moc2hvd1Byb2dyZXNzLCBmYWxzZSlcblxuXHRAZGVmaW5lIFwic2hvd1ZvbHVtZVwiLFxuXHRcdGdldDogLT4gQF9zaG93Vm9sdW1lXG5cdFx0c2V0OiAoc2hvd1ZvbHVtZSkgLT4gQHNldFZvbHVtZShzaG93Vm9sdW1lLCBmYWxzZSlcblxuXHRAZGVmaW5lIFwic2hvd1RpbWVcIixcblx0XHRnZXQ6IC0+IEBfc2hvd1RpbWVcblx0XHRzZXQ6IChzaG93VGltZSkgLT4gQGdldFRpbWUoc2hvd1RpbWUsIGZhbHNlKVxuXG5cdEBkZWZpbmUgXCJzaG93VGltZUxlZnRcIixcblx0XHRnZXQ6IC0+IEBfc2hvd1RpbWVMZWZ0XG5cdFx0c2V0OiAoc2hvd1RpbWVMZWZ0KSAtPiBAZ2V0VGltZUxlZnQoc2hvd1RpbWVMZWZ0LCBmYWxzZSlcblxuXHQjIENoZWNrcyBhIHByb3BlcnR5LCByZXR1cm5zIFwidHJ1ZVwiIG9yIFwiZmFsc2VcIlxuXHRfY2hlY2tCb29sZWFuOiAocHJvcGVydHkpIC0+XG5cdFx0aWYgXy5pc1N0cmluZyhwcm9wZXJ0eSlcblx0XHRcdGlmIHByb3BlcnR5LnRvTG93ZXJDYXNlKCkgaW4gW1wiMVwiLCBcInRydWVcIl1cblx0XHRcdFx0cHJvcGVydHkgPSB0cnVlXG5cdFx0XHRlbHNlIGlmIHByb3BlcnR5LnRvTG93ZXJDYXNlKCkgaW4gW1wiMFwiLCBcImZhbHNlXCJdXG5cdFx0XHRcdHByb3BlcnR5ID0gZmFsc2Vcblx0XHRcdGVsc2Vcblx0XHRcdFx0cmV0dXJuXG5cdFx0aWYgbm90IF8uaXNCb29sZWFuKHByb3BlcnR5KSB0aGVuIHJldHVyblxuXG5cdGdldFRpbWU6IChzaG93VGltZSkgLT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93VGltZSlcblx0XHRAX3Nob3dUaW1lID0gc2hvd1RpbWVcblxuXHRcdGlmIHNob3dUaW1lIGlzIHRydWVcblx0XHRcdEB0aW1lID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwiY3VycmVudFRpbWVcIlxuXG5cdFx0XHRAdGltZS5zdHlsZSA9IEB0aW1lU3R5bGVcblx0XHRcdEB0aW1lLmh0bWwgPSBcIjA6MDBcIlxuXG5cdFx0XHRAcGxheWVyLm9udGltZXVwZGF0ZSA9ID0+XG5cdFx0XHRcdEB0aW1lLmh0bWwgPSBAcGxheWVyLmZvcm1hdFRpbWUoKVxuXG5cdGdldFRpbWVMZWZ0OiAoc2hvd1RpbWVMZWZ0KSA9PlxuXHRcdEBfY2hlY2tCb29sZWFuKHNob3dUaW1lTGVmdClcblx0XHRAX3Nob3dUaW1lTGVmdCA9IHNob3dUaW1lTGVmdFxuXG5cdFx0aWYgc2hvd1RpbWVMZWZ0IGlzIHRydWVcblx0XHRcdEB0aW1lTGVmdCA9IG5ldyBMYXllclxuXHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIlxuXHRcdFx0XHRuYW1lOiBcInRpbWVMZWZ0XCJcblxuXHRcdFx0QHRpbWVMZWZ0LnN0eWxlID0gQHRpbWVTdHlsZVxuXG5cdFx0XHQjIFNldCB0aW1lTGVmdFxuXHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi0wOjAwXCJcblx0XHRcdEBwbGF5ZXIub24gXCJsb2FkZWRtZXRhZGF0YVwiLCA9PlxuXHRcdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHBsYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0XHRcdEBwbGF5ZXIub250aW1ldXBkYXRlID0gPT5cblx0XHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi1cIiArIEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdHNldFByb2dyZXNzOiAoc2hvd1Byb2dyZXNzKSAtPlxuXHRcdEBfY2hlY2tCb29sZWFuKHNob3dQcm9ncmVzcylcblxuXHRcdCMgU2V0IGFyZ3VtZW50IChzaG93UHJvZ3Jlc3MgaXMgZWl0aGVyIHRydWUgb3IgZmFsc2UpXG5cdFx0QF9zaG93UHJvZ3Jlc3MgPSBzaG93UHJvZ3Jlc3NcblxuXHRcdGlmIEBfc2hvd1Byb2dyZXNzIGlzIHRydWVcblxuXHRcdFx0IyBDcmVhdGUgUHJvZ3Jlc3MgQmFyICsgRGVmYXVsdHNcblx0XHRcdEBwcm9ncmVzc0JhciA9IG5ldyBTbGlkZXJDb21wb25lbnRcblx0XHRcdFx0d2lkdGg6IDIwMCwgaGVpZ2h0OiA2LCBiYWNrZ3JvdW5kQ29sb3I6IFwiI2VlZVwiXG5cdFx0XHRcdGtub2JTaXplOiAyMCwgdmFsdWU6IDAsIG1pbjogMFxuXG5cdFx0XHRAcGxheWVyLm9uY2FucGxheSA9ID0+IEBwcm9ncmVzc0Jhci5tYXggPSBNYXRoLnJvdW5kKEBwbGF5ZXIuZHVyYXRpb24pXG5cdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5kcmFnZ2FibGUubW9tZW50dW0gPSBmYWxzZVxuXG5cdFx0XHQjIENoZWNrIGlmIHRoZSBwbGF5ZXIgd2FzIHBsYXlpbmdcblx0XHRcdHdhc1BsYXlpbmcgPSBpc01vdmluZyA9IGZhbHNlXG5cdFx0XHR1bmxlc3MgQHBsYXllci5wYXVzZWQgdGhlbiB3YXNQbGF5aW5nID0gdHJ1ZVxuXG5cdFx0XHRAcHJvZ3Jlc3NCYXIub24gXCJjaGFuZ2U6dmFsdWVcIiwgPT5cblx0XHRcdFx0QHBsYXllci5jdXJyZW50VGltZSA9IEBwcm9ncmVzc0Jhci52YWx1ZVxuXG5cdFx0XHRcdGlmIEB0aW1lIGFuZCBAdGltZUxlZnRcblx0XHRcdFx0XHRAdGltZS5odG1sID0gQHBsYXllci5mb3JtYXRUaW1lKClcblx0XHRcdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHBsYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLm9uIEV2ZW50cy5EcmFnTW92ZSwgPT4gaXNNb3ZpbmcgPSB0cnVlXG5cblx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLm9uIEV2ZW50cy5EcmFnRW5kLCAoZXZlbnQpID0+XG5cdFx0XHRcdGN1cnJlbnRUaW1lID0gTWF0aC5yb3VuZChAcGxheWVyLmN1cnJlbnRUaW1lKVxuXHRcdFx0XHRkdXJhdGlvbiA9IE1hdGgucm91bmQoQHBsYXllci5kdXJhdGlvbilcblxuXHRcdFx0XHRpZiB3YXNQbGF5aW5nIGFuZCBjdXJyZW50VGltZSBpc250IGR1cmF0aW9uXG5cdFx0XHRcdFx0QHBsYXllci5wbGF5KClcblx0XHRcdFx0XHRAY29udHJvbHMuc2hvd1BhdXNlKClcblxuXHRcdFx0XHRpZiBjdXJyZW50VGltZSBpcyBkdXJhdGlvblxuXHRcdFx0XHRcdEBwbGF5ZXIucGF1c2UoKVxuXHRcdFx0XHRcdEBjb250cm9scy5zaG93UGxheSgpXG5cblx0XHRcdFx0cmV0dXJuIGlzTW92aW5nID0gZmFsc2VcblxuXHRcdFx0IyBVcGRhdGUgUHJvZ3Jlc3Ncblx0XHRcdEBwbGF5ZXIub250aW1ldXBkYXRlID0gPT5cblx0XHRcdFx0dW5sZXNzIGlzTW92aW5nXG5cdFx0XHRcdFx0QHByb2dyZXNzQmFyLmtub2IubWlkWCA9IEBwcm9ncmVzc0Jhci5wb2ludEZvclZhbHVlKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRcdFx0QHByb2dyZXNzQmFyLmtub2IuZHJhZ2dhYmxlLmlzTW92aW5nID0gZmFsc2VcblxuXHRcdFx0XHRpZiBAdGltZSBhbmQgQHRpbWVMZWZ0XG5cdFx0XHRcdFx0QHRpbWUuaHRtbCA9IEBwbGF5ZXIuZm9ybWF0VGltZSgpXG5cdFx0XHRcdFx0QHRpbWVMZWZ0Lmh0bWwgPSBcIi1cIiArIEBwbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cdHNldFZvbHVtZTogKHNob3dWb2x1bWUpIC0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1ZvbHVtZSlcblxuXHRcdCMgU2V0IGRlZmF1bHQgdG8gNzUlXG5cdFx0QHBsYXllci52b2x1bWUgPz0gMC43NVxuXG5cdFx0QHZvbHVtZUJhciA9IG5ldyBTbGlkZXJDb21wb25lbnRcblx0XHRcdHdpZHRoOiAyMDAsIGhlaWdodDogNlxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcIiNlZWVcIlxuXHRcdFx0a25vYlNpemU6IDIwXG5cdFx0XHRtaW46IDAsIG1heDogMVxuXHRcdFx0dmFsdWU6IEBwbGF5ZXIudm9sdW1lXG5cblx0XHRAdm9sdW1lQmFyLmtub2IuZHJhZ2dhYmxlLm1vbWVudHVtID0gZmFsc2VcblxuXHRcdEB2b2x1bWVCYXIub24gXCJjaGFuZ2U6d2lkdGhcIiwgPT5cblx0XHRcdEB2b2x1bWVCYXIudmFsdWUgPSBAcGxheWVyLnZvbHVtZVxuXG5cdFx0QHZvbHVtZUJhci5vbiBcImNoYW5nZTp2YWx1ZVwiLCA9PlxuXHRcdFx0QHBsYXllci52b2x1bWUgPSBAdm9sdW1lQmFyLnZhbHVlXG4iLCJjbGFzcyBleHBvcnRzLlZpZGVvUGxheWVyIGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cblx0XHQjIHBsYXkvcGF1c2UgY29udHJvbFxuXHRcdEBjb250cm9saGVpZ2h0ID0gODBcblxuXHRcdEBjb250cm9sc0FycmF5ID0gW11cblx0XHRAY29udHJvbHNBbmltYXRpb25zID0gW11cblxuXHRcdEB2aWRlb3dpZHRoID0gaWYgb3B0aW9ucy5mdWxsc2NyZWVuIHRoZW4gU2NyZWVuLndpZHRoIGVsc2Ugb3B0aW9ucy53aWR0aFxuXHRcdEB2aWRlb2hlaWdodCA9IGlmIG9wdGlvbnMuZnVsbHNjcmVlbiB0aGVuIFNjcmVlbi5oZWlnaHQgZWxzZSBvcHRpb25zLmhlaWdodFxuXG5cdFx0IyBoZXJlJ3Mgb3VyIGNvbnRhaW5lciBsYXllclxuXHRcdHN1cGVyXG5cdFx0XHR3aWR0aDogQHZpZGVvd2lkdGhcblx0XHRcdGhlaWdodDogQHZpZGVvaGVpZ2h0XG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IG51bGxcblxuXHRcdCMgY3JlYXRlIHRoZSB2aWRlb2xheWVyXG5cdFx0QHZpZGVvbGF5ZXIgPSBuZXcgVmlkZW9MYXllclxuXHRcdFx0d2lkdGg6IEB2aWRlb3dpZHRoXG5cdFx0XHRoZWlnaHQ6IEB2aWRlb2hlaWdodFxuXHRcdFx0c3VwZXJMYXllcjogQFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiAnIzAwMCdcblxuXHRcdCMgY3JlYXRlIHBsYXkvcGF1c2UgYnV0dG9uXG5cdFx0QHBsYXljb250cm9sID0gbmV3IExheWVyXG5cdFx0XHR3aWR0aDogQGNvbnRyb2xoZWlnaHRcblx0XHRcdGhlaWdodDogQGNvbnRyb2xoZWlnaHRcblx0XHRcdHN1cGVyTGF5ZXI6IEB2aWRlb2xheWVyXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IG51bGxcblx0XHRAcGxheWNvbnRyb2wueSA9IEB2aWRlb2xheWVyLmhlaWdodFxuXHRcdEBwbGF5Y29udHJvbC5zaG93UGxheSA9IC0+IEBpbWFnZSA9ICdpbWFnZXMvcGxheS5wbmcnXG5cdFx0QHBsYXljb250cm9sLnNob3dQYXVzZSA9IC0+IEBpbWFnZSA9ICdpbWFnZXMvcGF1c2UucG5nJ1xuXHRcdEBwbGF5Y29udHJvbC5zaG93UGxheSgpXG5cdFx0QHBsYXljb250cm9sLmNlbnRlcigpXG5cblx0XHQjIHBsYXkvcGF1c2UgYnV0dG9uIGV2ZW50IGxpc3RlbmluZ1xuXHRcdEB2aWRlb2xheWVyLm9uIEV2ZW50cy5DbGljaywgPT5cblx0XHRcdGlmIEB2aWRlb2xheWVyLnBsYXllci5wYXVzZWRcblx0XHRcdFx0QF9jdXJyZW50bHlQbGF5aW5nID0gdHJ1ZVxuXHRcdFx0XHRAdmlkZW9sYXllci5wbGF5ZXIucGxheSgpXG5cdFx0XHRcdEBmYWRlUGxheUJ1dHRvbigpIGlmIEBfc2h5UGxheUJ1dHRvblxuXHRcdFx0XHRAZmFkZUNvbnRyb2xzKCkgaWYgQF9zaHlDb250cm9sc1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAX2N1cnJlbnRseVBsYXlpbmcgPSBmYWxzZVxuXHRcdFx0XHRAdmlkZW9sYXllci5wbGF5ZXIucGF1c2UoKVxuXHRcdFx0XHRAZmFkZUJ1dHRvbkFuaW1hdGlvbi5zdG9wKCkgaWYgQGZhZGVCdXR0b25BbmltYXRpb25cblx0XHRcdFx0Zm9yIGFuaW1hdGlvbiBpbiBAY29udHJvbHNBbmltYXRpb25zXG5cdFx0XHRcdFx0YW5pbWF0aW9uLnN0b3AoKVxuXHRcdFx0XHRmb3IgbGF5ZXIgaW4gQGNvbnRyb2xzQXJyYXlcblx0XHRcdFx0XHRsYXllci5vcGFjaXR5ID0gMVxuXHRcdFx0XHRAcGxheWNvbnRyb2wub3BhY2l0eSA9IDFcblxuXHRcdCMgdmlkZW9sYXllciBldmVudCBsaXN0ZW5pbmdcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwicGF1c2VcIiwgPT5cblx0XHRcdEBwbGF5Y29udHJvbC5zaG93UGxheSgpIHVubGVzcyBAaXNTY3J1YmJpbmdcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwicGxheVwiLCA9PlxuXHRcdFx0QHBsYXljb250cm9sLnNob3dQYXVzZSgpXG5cdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcImVuZGVkXCIsID0+XG5cdFx0XHRAX2N1cnJlbnRseVBsYXlpbmcgPSBmYWxzZVxuXHRcdFx0QHZpZGVvbGF5ZXIucGxheWVyLnBhdXNlKClcblx0XHRcdEBmYWRlQnV0dG9uQW5pbWF0aW9uLnN0b3AoKSBpZiBAZmFkZUJ1dHRvbkFuaW1hdGlvblxuXHRcdFx0QHBsYXljb250cm9sLm9wYWNpdHkgPSAxXG5cdFx0XHRmb3IgYW5pbWF0aW9uIGluIEBjb250cm9sc0FuaW1hdGlvbnNcblx0XHRcdFx0XHRhbmltYXRpb24uc3RvcCgpXG5cdFx0XHRmb3IgbGF5ZXIgaW4gQGNvbnRyb2xzQXJyYXlcblx0XHRcdFx0bGF5ZXIub3BhY2l0eSA9IDFcblx0XHRAdmlkZW9sYXllci52aWRlbyA9IG9wdGlvbnMudmlkZW9cblxuXHRcdCMgdGltZSB0ZXh0IHN0eWxlc1xuXHRcdEB0aW1lU3R5bGUgPSB7IFwiZm9udC1zaXplXCI6IFwiMjBweFwiLCBcImNvbG9yXCI6IFwiIzAwMFwiIH1cblxuXHRcdCMgdGltZSB1dGlsaXRpZXNcblx0XHRAdmlkZW9sYXllci5mb3JtYXRUaW1lID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuXHRcdFx0c2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgJzAnICsgc2VjXG5cdFx0XHRyZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXHRcdEB2aWRlb2xheWVyLmZvcm1hdFRpbWVMZWZ0ID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5kdXJhdGlvbikgLSBNYXRoLmZsb29yKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblxuXHRAZGVmaW5lICdzaG93UHJvZ3Jlc3MnLFxuXHRcdGdldDogLT4gQF9zaG93UHJvZ3Jlc3Ncblx0XHRzZXQ6IChzaG93UHJvZ3Jlc3MpIC0+IEBzZXRQcm9ncmVzcyhzaG93UHJvZ3Jlc3MpXG5cblx0QGRlZmluZSAnc2hvd1RpbWVFbGFwc2VkJyxcblx0XHRnZXQ6IC0+IEBfc2hvd1RpbWVFbGFwc2VkXG5cdFx0c2V0OiAoc2hvd1RpbWVFbGFwc2VkKSAtPiBAc2V0VGltZUVsYXBzZWQoc2hvd1RpbWVFbGFwc2VkKVxuXG5cdEBkZWZpbmUgJ3Nob3dUaW1lTGVmdCcsXG5cdFx0Z2V0OiAtPiBAX3Nob3dUaW1lTGVmdFxuXHRcdHNldDogKHNob3dUaW1lTGVmdCkgLT4gQHNldFRpbWVMZWZ0KHNob3dUaW1lTGVmdClcblxuXHRAZGVmaW5lICdzaG93VGltZVRvdGFsJyxcblx0XHRnZXQ6IC0+IEBfc2hvd1RpbWVUb3RhbFxuXHRcdHNldDogKHNob3dUaW1lVG90YWwpIC0+IEBzZXRUaW1lVG90YWwoc2hvd1RpbWVUb3RhbClcblxuXHRAZGVmaW5lICdzaHlQbGF5QnV0dG9uJywgXG5cdFx0Z2V0OiAtPiBAX3NoeVBsYXlCdXR0b25cblx0XHRzZXQ6IChzaHlQbGF5QnV0dG9uKSAtPiBAc2V0U2h5UGxheUJ1dHRvbihzaHlQbGF5QnV0dG9uKVxuXG5cdEBkZWZpbmUgJ3NoeUNvbnRyb2xzJywgXG5cdFx0Z2V0OiAtPiBAX3NoeUNvbnRyb2xzXG5cdFx0c2V0OiAoc2h5Q29udHJvbHMpIC0+IEBzZXRTaHlDb250cm9scyhzaHlDb250cm9scylcblxuXHRAZGVmaW5lICdpc1BsYXlpbmcnLFxuXHRcdGdldDogLT4gQF9jdXJyZW50bHlQbGF5aW5nXG5cblxuXHRzZXRQcm9ncmVzczogKHNob3dQcm9ncmVzcykgLT5cblx0XHRAX3Nob3dQcm9ncmVzcyA9IHNob3dQcm9ncmVzc1xuXG5cdFx0QHByb2dyZXNzQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0d2lkdGg6IDQ0MFxuXHRcdFx0aGVpZ2h0OiAxMFxuXHRcdFx0a25vYlNpemU6IDQwXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6ICcjY2NjJ1xuXHRcdFx0bWluOiAwXG5cdFx0XHR2YWx1ZTogMFxuXHRcdEBjb250cm9sc0FycmF5LnB1c2ggQHByb2dyZXNzQmFyXG5cblx0XHRAcHJvZ3Jlc3NCYXIua25vYi5kcmFnZ2FibGUubW9tZW50dW0gPSBmYWxzZVxuXG5cdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcInRpbWV1cGRhdGVcIiwgPT5cblx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLm1pZFggPSBAcHJvZ3Jlc3NCYXIucG9pbnRGb3JWYWx1ZShAdmlkZW9sYXllci5wbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcImNhbnBsYXlcIiwgPT5cblx0XHRcdEBwcm9ncmVzc0Jhci5tYXggPSBNYXRoLnJvdW5kKEB2aWRlb2xheWVyLnBsYXllci5kdXJhdGlvbilcblxuXHRcdCMgc2NydWJiaW5nIHBlcmZvcm1zIGtpbmQgb2Ygc2hpdHR5IG9uIGFuIGlQaG9uZVxuXHRcdCMgYW5kIG5vbmUgb2YgdGhpcyBpcyB0aGF0IGdyZWF0IHdpdGggdmVyeSBsYXJnZSB2aWRlb3Ncblx0XHRAcHJvZ3Jlc3NCYXIub24gXCJjaGFuZ2U6dmFsdWVcIiwgPT5cblx0XHRcdGlmIEBpc1BsYXlpbmcgdGhlbiBAdmlkZW9sYXllci5wbGF5ZXIuY3VycmVudFRpbWUgPSBAcHJvZ3Jlc3NCYXIudmFsdWVcblx0XHRAcHJvZ3Jlc3NCYXIua25vYi5vbiBFdmVudHMuRHJhZ1N0YXJ0LCA9PlxuXHRcdFx0QGlzU2NydWJiaW5nID0gdHJ1ZVxuXHRcdFx0aWYgQGlzUGxheWluZyB0aGVuIEB2aWRlb2xheWVyLnBsYXllci5wYXVzZSgpXG5cdFx0QHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdFbmQsID0+XG5cdFx0XHRAaXNTY3J1YmJpbmcgPSBmYWxzZVxuXHRcdFx0QHZpZGVvbGF5ZXIucGxheWVyLmN1cnJlbnRUaW1lID0gQHByb2dyZXNzQmFyLnZhbHVlXG5cdFx0XHRpZiBAaXNQbGF5aW5nIHRoZW4gQHZpZGVvbGF5ZXIucGxheWVyLnBsYXkoKVxuXG5cdHNldFNoeVBsYXlCdXR0b246IChzaHlQbGF5QnV0dG9uKSAtPlxuXHRcdEBfc2h5UGxheUJ1dHRvbiA9IHNoeVBsYXlCdXR0b25cblx0ZmFkZVBsYXlCdXR0b246ICgpIC0+XG5cdFx0QGZhZGVCdXR0b25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uXG5cdFx0XHRsYXllcjogQHBsYXljb250cm9sXG5cdFx0XHRwcm9wZXJ0aWVzOlxuXHRcdFx0XHRvcGFjaXR5OiAwXG5cdFx0XHR0aW1lOiAyXG5cdFx0QGZhZGVCdXR0b25BbmltYXRpb24uc3RhcnQoKVxuXG5cdHNldFNoeUNvbnRyb2xzOiAoc2h5Q29udHJvbHMpIC0+XG5cdFx0QF9zaHlDb250cm9scyA9IHNoeUNvbnRyb2xzXG5cdGZhZGVDb250cm9sczogKCkgLT5cblx0XHRmb3IgbGF5ZXIsIGluZGV4IGluIEBjb250cm9sc0FycmF5XG5cdFx0XHRAY29udHJvbHNBbmltYXRpb25zW2luZGV4XSA9IG5ldyBBbmltYXRpb25cblx0XHRcdFx0bGF5ZXI6IGxheWVyXG5cdFx0XHRcdHByb3BlcnRpZXM6XG5cdFx0XHRcdFx0b3BhY2l0eTogMFxuXHRcdFx0XHR0aW1lOiAyXG5cdFx0XHRAY29udHJvbHNBbmltYXRpb25zW2luZGV4XS5zdGFydCgpXG5cdFx0XG5cdHNldFRpbWVFbGFwc2VkOiAoc2hvd1RpbWVFbGFwc2VkKSAtPlxuXHRcdEBfc2hvd1RpbWVFbGFwc2VkID0gc2hvd1RpbWVFbGFwc2VkXG5cblx0XHRpZiBzaG93VGltZUVsYXBzZWQgaXMgdHJ1ZVxuXHRcdFx0QHRpbWVFbGFwc2VkID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwiY3VycmVudFRpbWVcIlxuXHRcdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAdGltZUVsYXBzZWRcblxuXHRcdFx0QHRpbWVFbGFwc2VkLnN0eWxlID0gQHRpbWVTdHlsZVxuXHRcdFx0QHRpbWVFbGFwc2VkLmh0bWwgPSBcIjA6MDBcIlxuXG5cdFx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuXHRcdFx0XHRAdGltZUVsYXBzZWQuaHRtbCA9IEB2aWRlb2xheWVyLmZvcm1hdFRpbWUoKVxuXG5cdHNldFRpbWVMZWZ0OiAoc2hvd1RpbWVMZWZ0KSA9PlxuXHRcdEBfc2hvd1RpbWVMZWZ0ID0gc2hvd1RpbWVMZWZ0XG5cblx0XHRpZiBzaG93VGltZUxlZnQgaXMgdHJ1ZVxuXHRcdFx0QHRpbWVMZWZ0ID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwidGltZUxlZnRcIlxuXHRcdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAdGltZUxlZnRcblxuXHRcdFx0QHRpbWVMZWZ0LnN0eWxlID0gQHRpbWVTdHlsZVxuXG5cdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLTA6MDBcIlxuXHRcdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcImxvYWRlZG1ldGFkYXRhXCIsID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAdmlkZW9sYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0XHRcdEV2ZW50cy53cmFwKEB2aWRlb2xheWVyLnBsYXllcikub24gXCJ0aW1ldXBkYXRlXCIsID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAdmlkZW9sYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0c2V0VGltZVRvdGFsOiAoc2hvd1RpbWVUb3RhbCkgPT5cblx0XHRAX3Nob3dUaW1lVG90YWwgPSBzaG93VGltZVRvdGFsXG5cblx0XHRpZiBzaG93VGltZVRvdGFsIGlzIHRydWVcblx0XHRcdEB0aW1lVG90YWwgPSBuZXcgTGF5ZXJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0bmFtZTogXCJ0aW1lVG90YWxcIlxuXHRcdFx0QGNvbnRyb2xzQXJyYXkucHVzaCBAdGltZVRvdGFsXG5cblx0XHRcdEB0aW1lVG90YWwuc3R5bGUgPSBAdGltZVN0eWxlXG5cblx0XHRcdEB0aW1lVG90YWwuaHRtbCA9IFwiMDowMFwiXG5cdFx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwibG9hZGVkbWV0YWRhdGFcIiwgPT5cblx0XHRcdFx0QHRpbWVUb3RhbC5odG1sID0gQHZpZGVvbGF5ZXIuZm9ybWF0VGltZUxlZnQoKVxuXG5cbiJdfQ==
