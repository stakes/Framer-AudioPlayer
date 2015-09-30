class exports.VideoPlayer extends Layer

  constructor: (options={}) ->

    # instance vars for layers we will create
    @videoLayer = null
    @playButton = null

    # instance vars for layers we may create
    @progessBar = null
    @timeElapsed = null
    @timeLeft = null
    @timeTotal = null

    # internal instance vars we may create
    @_currentlyPlaying = null
    @_shyPlayButton = null
    @_shyControls = null
    @_isScrubbing = null
    @_showProgress = null
    @_showTimeElapsed = null
    @_showTimeLeft = null
    @_showTimeTotal = null
    @_controlsArray = []

    # play/pause control
    @playimage = "images/play.png"
    @pauseimage = "images/pause.png"

    options.playButtonDimensions ?= 80
    options.backgroundColor ?= "#000"
    options.width ?= 480
    options.height ?= 270
    if options.fullscreen
      options.width = Screen.width
      options.height = Screen.height

    # here's our container layer
    super
      width: options.width
      height: options.height
      backgroundColor: null

    # create the videolayer
    @videoLayer = new VideoLayer
      width: options.width
      height: options.height
      superLayer: @
      backgroundColor: options.backgroundColor
      name: "videoLayer"
    if options.autoplay then @videoLayer.player.autoplay = true
    if options.muted then @videoLayer.player.muted = true

    # create play/pause button
    @playButton = new Layer
      width: options.playButtonDimensions
      height: options.playButtonDimensions
      superLayer: @videoLayer
      backgroundColor: null
      name: "playButton"

    # set up the default playbutton
    @playButton.showPlay = => @playButton.image = @playimage
    @playButton.showPause = => @playButton.image = @pauseimage
    @playButton.showPlay()
    @playButton.center()

    # listen for events on the whole videolayer
    # or alternately, just on the play/pause button
    bindTo = if options.constrainToButton then @playButton else @videoLayer
    bindTo.on Events.Click, =>
      if @videoLayer.player.paused
        @emit "controls:play"
        @_currentlyPlaying = true
        @videoLayer.player.play()
        @fadePlayButton() if @_shyPlayButton
        @fadeControls() if @_shyControls
      else
        @emit "controls:pause"
        @_currentlyPlaying = false
        @videoLayer.player.pause()
        @playButton.animateStop()
        @playButton.opacity = 1
        for layer in @_controlsArray
          layer.animateStop()
          layer.opacity = 1
        
    # event listening on the videoLayer
    Events.wrap(@videoLayer.player).on "pause", =>
      @emit "video:pause"
      @playButton.showPlay() unless @_isScrubbing
    Events.wrap(@videoLayer.player).on "play", =>
      @emit "video:play"
      @playButton.showPause()
    Events.wrap(@videoLayer.player).on "ended", =>
      @emit "video:ended"
      @_currentlyPlaying = false
      @videoLayer.player.pause()
      @playButton.animateStop()
      @playButton.opacity = 1
      for layer in @_controlsArray
        layer.animateStop()
        layer.opacity = 1
    @videoLayer.video = options.video

    # default time text styles
    @timeStyle = { "font-size": "20px", "color": "#000" }

    # time utilities
    @videoLayer.formatTime = ->
      sec = Math.floor(@player.currentTime)
      min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      sec = if sec >= 10 then sec else "0" + sec
      return "#{min}:#{sec}"
    @videoLayer.formatTimeLeft = ->
      sec = Math.floor(@player.duration) - Math.floor(@player.currentTime)
      min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      sec = if sec >= 10 then sec else "0" + sec
      return "#{min}:#{sec}"


  # Getters n' setters
  @define "video",
    get: -> @videoLayer.player.src
    set: (video) ->
      @videoLayer.player.src = video

  @define "showProgress",
    get: -> @_showProgress
    set: (showProgress) -> @setProgress(showProgress)

  @define "showTimeElapsed",
    get: -> @_showTimeElapsed
    set: (showTimeElapsed) -> @setTimeElapsed(showTimeElapsed)

  @define "showTimeLeft",
    get: -> @_showTimeLeft
    set: (showTimeLeft) -> @setTimeLeft(showTimeLeft)

  @define "showTimeTotal",
    get: -> @_showTimeTotal
    set: (showTimeTotal) -> @setTimeTotal(showTimeTotal)

  @define "shyPlayButton", 
    get: -> @_shyPlayButton
    set: (shyPlayButton) -> @setShyPlayButton(shyPlayButton)

  @define "shyControls", 
    get: -> @_shyControls
    set: (shyControls) -> @setShyControls(shyControls)

  @define "playButtonImage",
    get: -> @playimage
    set: (playButtonImage) -> @setPlayButtonImage(playButtonImage)

  @define "pauseButtonImage",
    get: -> @pauseimage
    set: (pauseButtonImage) -> @setPauseButtonImage(pauseButtonImage)

  @define "player",
    get: -> @videoLayer.player


  # show the progress bar
  setProgress: (showProgress) ->
    @_showProgress = showProgress

    # create and set up the progress bar with default styles
    @progressBar = new SliderComponent
      width: 440
      height: 10
      knobSize: 40
      backgroundColor: "#ccc"
      min: 0
      value: 0
      name: "progressBar"
    @_controlsArray.push @progressBar
    @progressBar.knob.draggable.momentum = false

    # set and automate progress bar
    Events.wrap(@videoLayer.player).on "canplay", =>
      @progressBar.max = Math.round(@videoLayer.player.duration)
    Events.wrap(@videoLayer.player).on "timeupdate", =>
      @progressBar.knob.midX = @progressBar.pointForValue(@videoLayer.player.currentTime)

    # seeking/scrubbing events
    # and btw none of this works super great using very large videos
    @progressBar.on "change:value", =>
      if @_currentlyPlaying then @videoLayer.player.currentTime = @progressBar.value
    @progressBar.knob.on Events.DragStart, =>
      @_isScrubbing = true
      if @_currentlyPlaying then @videoLayer.player.pause()
    @progressBar.knob.on Events.DragEnd, =>
      @_isScrubbing = false
      @videoLayer.player.currentTime = @progressBar.value
      if @_currentlyPlaying then @videoLayer.player.play()

  # set flag for shy play button
  setShyPlayButton: (shyPlayButton) ->
    @_shyPlayButton = shyPlayButton
  # fade out the play button
  fadePlayButton: () ->
    @playButton.animate
      properties:
        opacity: 0
      time: 2

  # set flag for shy controls
  setShyControls: (shyControls) ->
    @_shyControls = shyControls
  # shortcut to fade out all the controls
  fadeControls: () ->
    for layer, index in @_controlsArray
      layer.animate
        properties:
          opacity: 0
        time: 2
    
  # show and increment elapsed time
  setTimeElapsed: (showTimeElapsed) ->
    @_showTimeElapsed = showTimeElapsed

    if showTimeElapsed is true
      @timeElapsed = new Layer
        backgroundColor: "transparent"
        name: "currentTime"
      @_controlsArray.push @timeElapsed

      @timeElapsed.style = @timeStyle
      @timeElapsed.html = "0:00"

      Events.wrap(@videoLayer.player).on "timeupdate", =>
        @timeElapsed.html = @videoLayer.formatTime()

  # show and decrement time remaining
  setTimeLeft: (showTimeLeft) =>
    @_showTimeLeft = showTimeLeft

    if showTimeLeft is true
      @timeLeft = new Layer
        backgroundColor: "transparent"
        name: "timeLeft"
      @_controlsArray.push @timeLeft

      @timeLeft.style = @timeStyle

      @timeLeft.html = "-0:00"
      Events.wrap(@videoLayer.player).on "loadedmetadata", =>
        @timeLeft.html = "-" + @videoLayer.formatTimeLeft()

      Events.wrap(@videoLayer.player).on "timeupdate", =>
        @timeLeft.html = "-" + @videoLayer.formatTimeLeft()

  # show a static timestamp for total duration
  setTimeTotal: (showTimeTotal) =>
    @_showTimeTotal = showTimeTotal

    if showTimeTotal is true
      @timeTotal = new Layer
        backgroundColor: "transparent"
        name: "timeTotal"
      @_controlsArray.push @timeTotal

      @timeTotal.style = @timeStyle

      @timeTotal.html = "0:00"
      Events.wrap(@videoLayer.player).on "loadedmetadata", =>
        @timeTotal.html = @videoLayer.formatTimeLeft()

  # set a new image for the play button
  setPlayButtonImage: (image) =>
    @playimage = image
    @playButton.image = image
    @playButton.showPlay = -> @image = image

  # set a new image for the pause button
  setPauseButtonImage: (image) =>
    @pauseimage = image
    @playButton.showPause = -> @image = image