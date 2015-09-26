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
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.VideoPlayer = (function(superClass) {
  extend(VideoPlayer, superClass);

  function VideoPlayer(options) {
    if (options == null) {
      options = {};
    }
    this.controlheight = 80;
    this.videowidth = options.fullscreen ? Screen.width : options.width;
    this.videoheight = options.fullscreen ? Screen.height : options.height;
    VideoPlayer.__super__.constructor.call(this, {
      width: this.videowidth + 15,
      height: this.videoheight + 15,
      backgroundColor: null
    });
    this.videolayer = new VideoLayer({
      width: this.videowidth,
      height: this.videoheight,
      superLayer: this,
      backgroundColor: null
    });
    this.playcontrol = new Layer({
      width: this.controlheight,
      height: this.controlheight,
      superLayer: this,
      backgroundColor: null
    });
    this.playcontrol.y = this.videolayer.height;
    this.playcontrol.showPlay = function() {
      return this.image = "images/play.png";
    };
    this.playcontrol.showPause = function() {
      return this.image = "images/pause.png";
    };
    this.playcontrol.showPlay();
    this.playcontrol.center();
    this.playcontrol.on(Events.Click, (function(_this) {
      return function() {
        if (_this.videolayer.player.paused) {
          _this._currentlyPlaying = true;
          return _this.videolayer.player.play();
        } else {
          _this._currentlyPlaying = false;
          return _this.videolayer.player.pause();
        }
      };
    })(this));
    Events.wrap(this.videolayer.player).on("pause", (function(_this) {
      return function() {
        return _this.playcontrol.showPlay();
      };
    })(this));
    Events.wrap(this.videolayer.player).on("play", (function(_this) {
      return function() {
        return _this.playcontrol.showPause();
      };
    })(this));
    Events.wrap(this.videolayer.player).on("ended", (function(_this) {
      return function() {};
    })(this));
    Events.wrap(this.videolayer.player).on("timeupdate", (function(_this) {
      return function() {};
    })(this));
    this.videolayer.video = options.video;
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

  VideoPlayer.define('isPlaying', {
    get: function() {
      return this._currentlyPlaying;
    }
  });

  VideoPlayer.prototype.setProgress = function(showProgress) {
    this._showProgress = showProgress;
    this.progressBar = new SliderComponent({
      width: this.videolayer.width,
      height: 10,
      y: this.videolayer.height - 10,
      backgroundColor: '#ccc',
      min: 0,
      value: 0,
      superLayer: this
    });
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
    this.progressBar.knob.on(Events.DragStart, (function(_this) {
      return function() {
        if (_this.isPlaying) {
          return _this.videolayer.player.pause();
        }
      };
    })(this));
    return this.progressBar.knob.on(Events.DragEnd, (function(_this) {
      return function() {
        print("end");
        _this.videolayer.player.currentTime = _this.progressBar.value;
        if (_this.isPlaying) {
          return _this.videolayer.player.play();
        }
      };
    })(this));
  };

  return VideoPlayer;

})(Layer);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL3ZpZGVvLXBsYXllci5mcmFtZXIvbW9kdWxlcy9hdWRpby5jb2ZmZWUiLCIvVXNlcnMvamF5c3Rha2Vsb24vRHJvcGJveCAoUGVyc29uYWwpL0NvZGUvRnJhbWVyLUF1ZGlvUGxheWVyL2V4YW1wbGVzL3ZpZGVvLXBsYXllci5mcmFtZXIvbW9kdWxlcy92aWRlb3BsYXllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBOzs7O0FBQU0sT0FBTyxDQUFDOzs7RUFFQSxxQkFBQyxPQUFEOztNQUFDLFVBQVE7Ozs7TUFDckIsT0FBTyxDQUFDLGtCQUFtQjs7SUFHM0IsSUFBQyxDQUFBLE1BQUQsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtJQUNWLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFxQixvQkFBckIsRUFBMkMsTUFBM0M7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsU0FBckIsRUFBZ0MsTUFBaEM7SUFDQSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFkLEdBQXNCO0lBQ3RCLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQWQsR0FBdUI7SUFFdkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxFQUFSLEdBQWEsSUFBQyxDQUFBLE1BQU0sQ0FBQztJQUNyQixJQUFDLENBQUEsTUFBTSxDQUFDLEdBQVIsR0FBYyxJQUFDLENBQUEsTUFBTSxDQUFDO0lBRXRCLDZDQUFNLE9BQU47SUFHQSxJQUFDLENBQUEsUUFBRCxHQUFnQixJQUFBLEtBQUEsQ0FDZjtNQUFBLGVBQUEsRUFBaUIsYUFBakI7TUFDQSxLQUFBLEVBQU8sRUFE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LENBQTlDO0lBTUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBbEIsQ0FBcUIsTUFBTSxDQUFDLFNBQTVCLEVBQXVDLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQTtRQUN0QyxJQUFHLEtBQUMsQ0FBQSxTQUFKO2lCQUFtQixLQUFDLENBQUEsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFuQixDQUFBLEVBQW5COztNQURzQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkM7V0FFQSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFsQixDQUFxQixNQUFNLENBQUMsT0FBNUIsRUFBcUMsQ0FBQSxTQUFBLEtBQUE7YUFBQSxTQUFBO1FBQ3BDLEtBQUEsQ0FBTSxLQUFOO1FBQ0EsS0FBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBbkIsR0FBaUMsS0FBQyxDQUFBLFdBQVcsQ0FBQztRQUM5QyxJQUFHLEtBQUMsQ0FBQSxTQUFKO2lCQUFtQixLQUFDLENBQUEsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFuQixDQUFBLEVBQW5COztNQUhvQztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckM7RUF4Qlk7Ozs7R0E3RW9CIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIGV4cG9ydHMuQXVkaW9QbGF5ZXIgZXh0ZW5kcyBMYXllclxuXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucz17fSkgLT5cblx0XHRvcHRpb25zLmJhY2tncm91bmRDb2xvciA/PSBcInRyYW5zcGFyZW50XCJcblxuXHRcdCMgRGVmaW5lIHBsYXllclxuXHRcdEBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIilcblx0XHRAcGxheWVyLnNldEF0dHJpYnV0ZShcIndlYmtpdC1wbGF5c2lubGluZVwiLCBcInRydWVcIilcblx0XHRAcGxheWVyLnNldEF0dHJpYnV0ZShcInByZWxvYWRcIiwgXCJhdXRvXCIpXG5cdFx0QHBsYXllci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiXG5cdFx0QHBsYXllci5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIlxuXG5cdFx0QHBsYXllci5vbiA9IEBwbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lclxuXHRcdEBwbGF5ZXIub2ZmID0gQHBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyXG5cblx0XHRzdXBlciBvcHRpb25zXG5cblx0XHQjIERlZmluZSBiYXNpYyBjb250cm9sc1xuXHRcdEBjb250cm9scyA9IG5ldyBMYXllclxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdHdpZHRoOiA4MCwgaGVpZ2h0OiA4MCwgc3VwZXJMYXllcjogQFxuXHRcdFx0bmFtZTogXCJjb250cm9sc1wiXG5cblx0XHRAY29udHJvbHMuc2hvd1BsYXkgPSAtPiBAaW1hZ2UgPSBcImltYWdlcy9wbGF5LnBuZ1wiXG5cdFx0QGNvbnRyb2xzLnNob3dQYXVzZSA9IC0+IEBpbWFnZSA9IFwiaW1hZ2VzL3BhdXNlLnBuZ1wiXG5cdFx0QGNvbnRyb2xzLnNob3dQbGF5KClcblx0XHRAY29udHJvbHMuY2VudGVyKClcblxuXHRcdEB0aW1lU3R5bGUgPSB7IFwiZm9udC1zaXplXCI6IFwiMjBweFwiLCBcImNvbG9yXCI6IFwiIzAwMFwiIH1cblxuXHRcdCMgT24gY2xpY2tcblx0XHRAb24gRXZlbnRzLkNsaWNrLCAtPlxuXHRcdFx0Y3VycmVudFRpbWUgPSBNYXRoLnJvdW5kKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRkdXJhdGlvbiA9IE1hdGgucm91bmQoQHBsYXllci5kdXJhdGlvbilcblxuXHRcdFx0aWYgQHBsYXllci5wYXVzZWRcblx0XHRcdFx0QHBsYXllci5wbGF5KClcblx0XHRcdFx0QGNvbnRyb2xzLnNob3dQYXVzZSgpXG5cblx0XHRcdFx0aWYgY3VycmVudFRpbWUgaXMgZHVyYXRpb25cblx0XHRcdFx0XHRAcGxheWVyLmN1cnJlbnRUaW1lID0gMFxuXHRcdFx0XHRcdEBwbGF5ZXIucGxheSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBwbGF5ZXIucGF1c2UoKVxuXHRcdFx0XHRAY29udHJvbHMuc2hvd1BsYXkoKVxuXG5cdFx0IyBPbiBlbmQsIHN3aXRjaCB0byBwbGF5IGJ1dHRvblxuXHRcdEBwbGF5ZXIub25wbGF5aW5nID0gPT4gQGNvbnRyb2xzLnNob3dQYXVzZSgpXG5cdFx0QHBsYXllci5vbmVuZGVkID0gPT4gQGNvbnRyb2xzLnNob3dQbGF5KClcblxuXHRcdCMgVXRpbHNcblx0XHRAcGxheWVyLmZvcm1hdFRpbWUgPSAtPlxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihAY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblx0XHRAcGxheWVyLmZvcm1hdFRpbWVMZWZ0ID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQGR1cmF0aW9uKSAtIE1hdGguZmxvb3IoQGN1cnJlbnRUaW1lKVxuXHRcdFx0bWluID0gTWF0aC5mbG9vcihzZWMgLyA2MClcblx0XHRcdHNlYyA9IE1hdGguZmxvb3Ioc2VjICUgNjApXG5cdFx0XHRzZWMgPSBpZiBzZWMgPj0gMTAgdGhlbiBzZWMgZWxzZSAnMCcgKyBzZWNcblx0XHRcdHJldHVybiBcIiN7bWlufToje3NlY31cIlxuXG5cdFx0QGF1ZGlvID0gb3B0aW9ucy5hdWRpb1xuXHRcdEBfZWxlbWVudC5hcHBlbmRDaGlsZChAcGxheWVyKVxuXG5cdEBkZWZpbmUgXCJhdWRpb1wiLFxuXHRcdGdldDogLT4gQHBsYXllci5zcmNcblx0XHRzZXQ6IChhdWRpbykgLT5cblx0XHRcdEBwbGF5ZXIuc3JjID0gYXVkaW9cblx0XHRcdGlmIEBwbGF5ZXIuY2FuUGxheVR5cGUoXCJhdWRpby9tcDNcIikgPT0gXCJcIlxuXHRcdFx0XHR0aHJvdyBFcnJvciBcIk5vIHN1cHBvcnRlZCBhdWRpbyBmaWxlIGluY2x1ZGVkLlwiXG5cblx0QGRlZmluZSBcInNob3dQcm9ncmVzc1wiLFxuXHRcdGdldDogLT4gQF9zaG93UHJvZ3Jlc3Ncblx0XHRzZXQ6IChzaG93UHJvZ3Jlc3MpIC0+IEBzZXRQcm9ncmVzcyhzaG93UHJvZ3Jlc3MsIGZhbHNlKVxuXG5cdEBkZWZpbmUgXCJzaG93Vm9sdW1lXCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dWb2x1bWVcblx0XHRzZXQ6IChzaG93Vm9sdW1lKSAtPiBAc2V0Vm9sdW1lKHNob3dWb2x1bWUsIGZhbHNlKVxuXG5cdEBkZWZpbmUgXCJzaG93VGltZVwiLFxuXHRcdGdldDogLT4gQF9zaG93VGltZVxuXHRcdHNldDogKHNob3dUaW1lKSAtPiBAZ2V0VGltZShzaG93VGltZSwgZmFsc2UpXG5cblx0QGRlZmluZSBcInNob3dUaW1lTGVmdFwiLFxuXHRcdGdldDogLT4gQF9zaG93VGltZUxlZnRcblx0XHRzZXQ6IChzaG93VGltZUxlZnQpIC0+IEBnZXRUaW1lTGVmdChzaG93VGltZUxlZnQsIGZhbHNlKVxuXG5cdCMgQ2hlY2tzIGEgcHJvcGVydHksIHJldHVybnMgXCJ0cnVlXCIgb3IgXCJmYWxzZVwiXG5cdF9jaGVja0Jvb2xlYW46IChwcm9wZXJ0eSkgLT5cblx0XHRpZiBfLmlzU3RyaW5nKHByb3BlcnR5KVxuXHRcdFx0aWYgcHJvcGVydHkudG9Mb3dlckNhc2UoKSBpbiBbXCIxXCIsIFwidHJ1ZVwiXVxuXHRcdFx0XHRwcm9wZXJ0eSA9IHRydWVcblx0XHRcdGVsc2UgaWYgcHJvcGVydHkudG9Mb3dlckNhc2UoKSBpbiBbXCIwXCIsIFwiZmFsc2VcIl1cblx0XHRcdFx0cHJvcGVydHkgPSBmYWxzZVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBub3QgXy5pc0Jvb2xlYW4ocHJvcGVydHkpIHRoZW4gcmV0dXJuXG5cblx0Z2V0VGltZTogKHNob3dUaW1lKSAtPlxuXHRcdEBfY2hlY2tCb29sZWFuKHNob3dUaW1lKVxuXHRcdEBfc2hvd1RpbWUgPSBzaG93VGltZVxuXG5cdFx0aWYgc2hvd1RpbWUgaXMgdHJ1ZVxuXHRcdFx0QHRpbWUgPSBuZXcgTGF5ZXJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0bmFtZTogXCJjdXJyZW50VGltZVwiXG5cblx0XHRcdEB0aW1lLnN0eWxlID0gQHRpbWVTdHlsZVxuXHRcdFx0QHRpbWUuaHRtbCA9IFwiMDowMFwiXG5cblx0XHRcdEBwbGF5ZXIub250aW1ldXBkYXRlID0gPT5cblx0XHRcdFx0QHRpbWUuaHRtbCA9IEBwbGF5ZXIuZm9ybWF0VGltZSgpXG5cblx0Z2V0VGltZUxlZnQ6IChzaG93VGltZUxlZnQpID0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1RpbWVMZWZ0KVxuXHRcdEBfc2hvd1RpbWVMZWZ0ID0gc2hvd1RpbWVMZWZ0XG5cblx0XHRpZiBzaG93VGltZUxlZnQgaXMgdHJ1ZVxuXHRcdFx0QHRpbWVMZWZ0ID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwidGltZUxlZnRcIlxuXG5cdFx0XHRAdGltZUxlZnQuc3R5bGUgPSBAdGltZVN0eWxlXG5cblx0XHRcdCMgU2V0IHRpbWVMZWZ0XG5cdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLTA6MDBcIlxuXHRcdFx0QHBsYXllci5vbiBcImxvYWRlZG1ldGFkYXRhXCIsID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRcdFx0QHBsYXllci5vbnRpbWV1cGRhdGUgPSA9PlxuXHRcdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHBsYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0c2V0UHJvZ3Jlc3M6IChzaG93UHJvZ3Jlc3MpIC0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1Byb2dyZXNzKVxuXG5cdFx0IyBTZXQgYXJndW1lbnQgKHNob3dQcm9ncmVzcyBpcyBlaXRoZXIgdHJ1ZSBvciBmYWxzZSlcblx0XHRAX3Nob3dQcm9ncmVzcyA9IHNob3dQcm9ncmVzc1xuXG5cdFx0aWYgQF9zaG93UHJvZ3Jlc3MgaXMgdHJ1ZVxuXG5cdFx0XHQjIENyZWF0ZSBQcm9ncmVzcyBCYXIgKyBEZWZhdWx0c1xuXHRcdFx0QHByb2dyZXNzQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0XHR3aWR0aDogMjAwLCBoZWlnaHQ6IDYsIGJhY2tncm91bmRDb2xvcjogXCIjZWVlXCJcblx0XHRcdFx0a25vYlNpemU6IDIwLCB2YWx1ZTogMCwgbWluOiAwXG5cblx0XHRcdEBwbGF5ZXIub25jYW5wbGF5ID0gPT4gQHByb2dyZXNzQmFyLm1heCA9IE1hdGgucm91bmQoQHBsYXllci5kdXJhdGlvbilcblx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLmRyYWdnYWJsZS5tb21lbnR1bSA9IGZhbHNlXG5cblx0XHRcdCMgQ2hlY2sgaWYgdGhlIHBsYXllciB3YXMgcGxheWluZ1xuXHRcdFx0d2FzUGxheWluZyA9IGlzTW92aW5nID0gZmFsc2Vcblx0XHRcdHVubGVzcyBAcGxheWVyLnBhdXNlZCB0aGVuIHdhc1BsYXlpbmcgPSB0cnVlXG5cblx0XHRcdEBwcm9ncmVzc0Jhci5vbiBcImNoYW5nZTp2YWx1ZVwiLCA9PlxuXHRcdFx0XHRAcGxheWVyLmN1cnJlbnRUaW1lID0gQHByb2dyZXNzQmFyLnZhbHVlXG5cblx0XHRcdFx0aWYgQHRpbWUgYW5kIEB0aW1lTGVmdFxuXHRcdFx0XHRcdEB0aW1lLmh0bWwgPSBAcGxheWVyLmZvcm1hdFRpbWUoKVxuXHRcdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdNb3ZlLCA9PiBpc01vdmluZyA9IHRydWVcblxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdFbmQsIChldmVudCkgPT5cblx0XHRcdFx0Y3VycmVudFRpbWUgPSBNYXRoLnJvdW5kKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRcdGR1cmF0aW9uID0gTWF0aC5yb3VuZChAcGxheWVyLmR1cmF0aW9uKVxuXG5cdFx0XHRcdGlmIHdhc1BsYXlpbmcgYW5kIGN1cnJlbnRUaW1lIGlzbnQgZHVyYXRpb25cblx0XHRcdFx0XHRAcGxheWVyLnBsYXkoKVxuXHRcdFx0XHRcdEBjb250cm9scy5zaG93UGF1c2UoKVxuXG5cdFx0XHRcdGlmIGN1cnJlbnRUaW1lIGlzIGR1cmF0aW9uXG5cdFx0XHRcdFx0QHBsYXllci5wYXVzZSgpXG5cdFx0XHRcdFx0QGNvbnRyb2xzLnNob3dQbGF5KClcblxuXHRcdFx0XHRyZXR1cm4gaXNNb3ZpbmcgPSBmYWxzZVxuXG5cdFx0XHQjIFVwZGF0ZSBQcm9ncmVzc1xuXHRcdFx0QHBsYXllci5vbnRpbWV1cGRhdGUgPSA9PlxuXHRcdFx0XHR1bmxlc3MgaXNNb3Zpbmdcblx0XHRcdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5taWRYID0gQHByb2dyZXNzQmFyLnBvaW50Rm9yVmFsdWUoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5kcmFnZ2FibGUuaXNNb3ZpbmcgPSBmYWxzZVxuXG5cdFx0XHRcdGlmIEB0aW1lIGFuZCBAdGltZUxlZnRcblx0XHRcdFx0XHRAdGltZS5odG1sID0gQHBsYXllci5mb3JtYXRUaW1lKClcblx0XHRcdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHBsYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0c2V0Vm9sdW1lOiAoc2hvd1ZvbHVtZSkgLT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93Vm9sdW1lKVxuXG5cdFx0IyBTZXQgZGVmYXVsdCB0byA3NSVcblx0XHRAcGxheWVyLnZvbHVtZSA/PSAwLjc1XG5cblx0XHRAdm9sdW1lQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0d2lkdGg6IDIwMCwgaGVpZ2h0OiA2XG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwiI2VlZVwiXG5cdFx0XHRrbm9iU2l6ZTogMjBcblx0XHRcdG1pbjogMCwgbWF4OiAxXG5cdFx0XHR2YWx1ZTogQHBsYXllci52b2x1bWVcblxuXHRcdEB2b2x1bWVCYXIua25vYi5kcmFnZ2FibGUubW9tZW50dW0gPSBmYWxzZVxuXG5cdFx0QHZvbHVtZUJhci5vbiBcImNoYW5nZTp3aWR0aFwiLCA9PlxuXHRcdFx0QHZvbHVtZUJhci52YWx1ZSA9IEBwbGF5ZXIudm9sdW1lXG5cblx0XHRAdm9sdW1lQmFyLm9uIFwiY2hhbmdlOnZhbHVlXCIsID0+XG5cdFx0XHRAcGxheWVyLnZvbHVtZSA9IEB2b2x1bWVCYXIudmFsdWVcbiIsImNsYXNzIGV4cG9ydHMuVmlkZW9QbGF5ZXIgZXh0ZW5kcyBMYXllclxuXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucz17fSkgLT5cblxuXHRcdEBjb250cm9saGVpZ2h0ID0gODBcblx0XHRAdmlkZW93aWR0aCA9IGlmIG9wdGlvbnMuZnVsbHNjcmVlbiB0aGVuIFNjcmVlbi53aWR0aCBlbHNlIG9wdGlvbnMud2lkdGhcblx0XHRAdmlkZW9oZWlnaHQgPSBpZiBvcHRpb25zLmZ1bGxzY3JlZW4gdGhlbiBTY3JlZW4uaGVpZ2h0IGVsc2Ugb3B0aW9ucy5oZWlnaHRcblxuXG5cdFx0IyBoZXJlJ3Mgb3VyIGNvbnRhaW5lciBsYXllclxuXHRcdHN1cGVyXG5cdFx0XHR3aWR0aDogQHZpZGVvd2lkdGggKyAxNVxuXHRcdFx0aGVpZ2h0OiBAdmlkZW9oZWlnaHQgKyAxNVxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBudWxsXG5cblx0XHQjIGNyZWF0ZSB0aGUgdmlkZW9sYXllclxuXHRcdEB2aWRlb2xheWVyID0gbmV3IFZpZGVvTGF5ZXJcblx0XHRcdHdpZHRoOiBAdmlkZW93aWR0aFxuXHRcdFx0aGVpZ2h0OiBAdmlkZW9oZWlnaHRcblx0XHRcdHN1cGVyTGF5ZXI6IEBcblx0XHRcdGJhY2tncm91bmRDb2xvcjogbnVsbFxuXG5cdFx0IyBjcmVhdGUgcGxheS9wYXVzZSBidXR0b25cblx0XHRAcGxheWNvbnRyb2wgPSBuZXcgTGF5ZXJcblx0XHRcdHdpZHRoOiBAY29udHJvbGhlaWdodFxuXHRcdFx0aGVpZ2h0OiBAY29udHJvbGhlaWdodFxuXHRcdFx0c3VwZXJMYXllcjogQFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBudWxsXG5cdFx0QHBsYXljb250cm9sLnkgPSBAdmlkZW9sYXllci5oZWlnaHRcblx0XHRAcGxheWNvbnRyb2wuc2hvd1BsYXkgPSAtPiBAaW1hZ2UgPSBcImltYWdlcy9wbGF5LnBuZ1wiXG5cdFx0QHBsYXljb250cm9sLnNob3dQYXVzZSA9IC0+IEBpbWFnZSA9IFwiaW1hZ2VzL3BhdXNlLnBuZ1wiXG5cdFx0QHBsYXljb250cm9sLnNob3dQbGF5KClcblx0XHRAcGxheWNvbnRyb2wuY2VudGVyKClcblxuXHRcdCMgcGxheS9wYXVzZSBidXR0b24gZXZlbnQgbGlzdGVuaW5nXG5cdFx0QHBsYXljb250cm9sLm9uIEV2ZW50cy5DbGljaywgPT5cblx0XHRcdGlmIEB2aWRlb2xheWVyLnBsYXllci5wYXVzZWRcblx0XHRcdFx0QF9jdXJyZW50bHlQbGF5aW5nID0gdHJ1ZVxuXHRcdFx0XHRAdmlkZW9sYXllci5wbGF5ZXIucGxheSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBfY3VycmVudGx5UGxheWluZyA9IGZhbHNlXG5cdFx0XHRcdEB2aWRlb2xheWVyLnBsYXllci5wYXVzZSgpXG5cblx0XHQjIHZpZGVvbGF5ZXIgZXZlbnQgbGlzdGVuaW5nXG5cdFx0RXZlbnRzLndyYXAoQHZpZGVvbGF5ZXIucGxheWVyKS5vbiBcInBhdXNlXCIsID0+XG5cdFx0XHRAcGxheWNvbnRyb2wuc2hvd1BsYXkoKVxuXHRcdEV2ZW50cy53cmFwKEB2aWRlb2xheWVyLnBsYXllcikub24gXCJwbGF5XCIsID0+XG5cdFx0XHRAcGxheWNvbnRyb2wuc2hvd1BhdXNlKClcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwiZW5kZWRcIiwgPT5cblx0XHRcdCMgZG8gbm90aGluZyB5ZXRcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuXHRcdFx0IyBkbyBub3RoaW5nIGhlcmUgeWV0XG5cblx0XHRAdmlkZW9sYXllci52aWRlbyA9IG9wdGlvbnMudmlkZW9cblxuXHRcdCMgdGltZSB1dGlsaXRpZXNcblx0XHRAdmlkZW9sYXllci5mb3JtYXRUaW1lID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdG1pbiA9IE1hdGguZmxvb3Ioc2VjIC8gNjApXG5cdFx0XHRzZWMgPSBNYXRoLmZsb29yKHNlYyAlIDYwKVxuXHRcdFx0c2VjID0gaWYgc2VjID49IDEwIHRoZW4gc2VjIGVsc2UgJzAnICsgc2VjXG5cdFx0XHRyZXR1cm4gXCIje21pbn06I3tzZWN9XCJcblxuXHRcdEB2aWRlb2xheWVyLmZvcm1hdFRpbWVMZWZ0ID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQHBsYXllci5kdXJhdGlvbikgLSBNYXRoLmZsb29yKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblx0QGRlZmluZSAnc2hvd1Byb2dyZXNzJyxcblx0XHRnZXQ6IC0+IEBfc2hvd1Byb2dyZXNzXG5cdFx0c2V0OiAoc2hvd1Byb2dyZXNzKSAtPiBAc2V0UHJvZ3Jlc3Moc2hvd1Byb2dyZXNzKVxuXG5cdEBkZWZpbmUgJ2lzUGxheWluZycsXG5cdFx0Z2V0OiAtPiBAX2N1cnJlbnRseVBsYXlpbmdcblxuXHRzZXRQcm9ncmVzczogKHNob3dQcm9ncmVzcykgLT5cblx0XHRAX3Nob3dQcm9ncmVzcyA9IHNob3dQcm9ncmVzc1xuXG5cdFx0QHByb2dyZXNzQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0d2lkdGg6IEB2aWRlb2xheWVyLndpZHRoXG5cdFx0XHRoZWlnaHQ6IDEwXG5cdFx0XHR5OiBAdmlkZW9sYXllci5oZWlnaHQgLSAxMFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiAnI2NjYydcblx0XHRcdG1pbjogMFxuXHRcdFx0dmFsdWU6IDBcblx0XHRcdHN1cGVyTGF5ZXI6IEBcblxuXHRcdEBwcm9ncmVzc0Jhci5rbm9iLmRyYWdnYWJsZS5tb21lbnR1bSA9IGZhbHNlXG5cblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwidGltZXVwZGF0ZVwiLCA9PlxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2IubWlkWCA9IEBwcm9ncmVzc0Jhci5wb2ludEZvclZhbHVlKEB2aWRlb2xheWVyLnBsYXllci5jdXJyZW50VGltZSlcblx0XHRFdmVudHMud3JhcChAdmlkZW9sYXllci5wbGF5ZXIpLm9uIFwiY2FucGxheVwiLCA9PlxuXHRcdFx0QHByb2dyZXNzQmFyLm1heCA9IE1hdGgucm91bmQoQHZpZGVvbGF5ZXIucGxheWVyLmR1cmF0aW9uKVxuXG5cdFx0IyB0aGlzIHBlcmZvcm1zIHNvIHNoaXR0eSBvbiBhbiBpUGhvbmVcblx0XHQjIEBwcm9ncmVzc0Jhci5vbiBcImNoYW5nZTp2YWx1ZVwiLCA9PlxuXHRcdCMgXHRpZiBAaXNQbGF5aW5nIHRoZW4gQHZpZGVvbGF5ZXIucGxheWVyLmN1cnJlbnRUaW1lID0gQHByb2dyZXNzQmFyLnZhbHVlXG5cdFx0QHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdTdGFydCwgPT5cblx0XHRcdGlmIEBpc1BsYXlpbmcgdGhlbiBAdmlkZW9sYXllci5wbGF5ZXIucGF1c2UoKVxuXHRcdEBwcm9ncmVzc0Jhci5rbm9iLm9uIEV2ZW50cy5EcmFnRW5kLCA9PlxuXHRcdFx0cHJpbnQgXCJlbmRcIlxuXHRcdFx0QHZpZGVvbGF5ZXIucGxheWVyLmN1cnJlbnRUaW1lID0gQHByb2dyZXNzQmFyLnZhbHVlXG5cdFx0XHRpZiBAaXNQbGF5aW5nIHRoZW4gQHZpZGVvbGF5ZXIucGxheWVyLnBsYXkoKVxuXG5cblxuIl19
