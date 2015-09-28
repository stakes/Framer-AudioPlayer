class exports.VideoPlayer extends Layer

	constructor: (options={}) ->

		# play/pause control
		@controlheight = 80

		@controlsArray = []
		@controlsAnimations = []

		@videowidth = if options.fullscreen then Screen.width else options.width
		@videoheight = if options.fullscreen then Screen.height else options.height

		# here's our container layer
		super
			width: @videowidth
			height: @videoheight
			backgroundColor: null

		# create the videolayer
		@videolayer = new VideoLayer
			width: @videowidth
			height: @videoheight
			superLayer: @
			backgroundColor: '#000'

		# create play/pause button
		@playcontrol = new Layer
			width: @controlheight
			height: @controlheight
			superLayer: @videolayer
			backgroundColor: null
		@playcontrol.y = @videolayer.height
		@playcontrol.showPlay = -> @image = 'images/play.png'
		@playcontrol.showPause = -> @image = 'images/pause.png'
		@playcontrol.showPlay()
		@playcontrol.center()

		# play/pause button event listening
		@videolayer.on Events.Click, =>
			if @videolayer.player.paused
				@_currentlyPlaying = true
				@videolayer.player.play()
				@fadePlayButton() if @_shyPlayButton
				@fadeControls() if @_shyControls
			else
				@_currentlyPlaying = false
				@videolayer.player.pause()
				@fadeButtonAnimation.stop() if @fadeButtonAnimation
				for animation in @controlsAnimations
					animation.stop()
				for layer in @controlsArray
					layer.opacity = 1
				@playcontrol.opacity = 1

		# videolayer event listening
		Events.wrap(@videolayer.player).on "pause", =>
			@playcontrol.showPlay() unless @isScrubbing
		Events.wrap(@videolayer.player).on "play", =>
			@playcontrol.showPause()
		Events.wrap(@videolayer.player).on "ended", =>
			@_currentlyPlaying = false
			@videolayer.player.pause()
			@fadeButtonAnimation.stop() if @fadeButtonAnimation
			@playcontrol.opacity = 1
			for animation in @controlsAnimations
					animation.stop()
			for layer in @controlsArray
				layer.opacity = 1
		@videolayer.video = options.video

		# time text styles
		@timeStyle = { "font-size": "20px", "color": "#000" }

		# time utilities
		@videolayer.formatTime = ->
			sec = Math.floor(@player.currentTime)
			min = Math.floor(sec / 60)
			sec = Math.floor(sec % 60)
			sec = if sec >= 10 then sec else '0' + sec
			return "#{min}:#{sec}"

		@videolayer.formatTimeLeft = ->
			sec = Math.floor(@player.duration) - Math.floor(@player.currentTime)
			min = Math.floor(sec / 60)
			sec = Math.floor(sec % 60)
			sec = if sec >= 10 then sec else '0' + sec
			return "#{min}:#{sec}"


	@define 'showProgress',
		get: -> @_showProgress
		set: (showProgress) -> @setProgress(showProgress)

	@define 'showTimeElapsed',
		get: -> @_showTimeElapsed
		set: (showTimeElapsed) -> @setTimeElapsed(showTimeElapsed)

	@define 'showTimeLeft',
		get: -> @_showTimeLeft
		set: (showTimeLeft) -> @setTimeLeft(showTimeLeft)

	@define 'showTimeTotal',
		get: -> @_showTimeTotal
		set: (showTimeTotal) -> @setTimeTotal(showTimeTotal)

	@define 'shyPlayButton', 
		get: -> @_shyPlayButton
		set: (shyPlayButton) -> @setShyPlayButton(shyPlayButton)

	@define 'shyControls', 
		get: -> @_shyControls
		set: (shyControls) -> @setShyControls(shyControls)

	@define 'isPlaying',
		get: -> @_currentlyPlaying


	setProgress: (showProgress) ->
		@_showProgress = showProgress

		@progressBar = new SliderComponent
			width: 440
			height: 10
			knobSize: 40
			backgroundColor: '#ccc'
			min: 0
			value: 0
		@controlsArray.push @progressBar

		@progressBar.knob.draggable.momentum = false

		Events.wrap(@videolayer.player).on "timeupdate", =>
			@progressBar.knob.midX = @progressBar.pointForValue(@videolayer.player.currentTime)
		Events.wrap(@videolayer.player).on "canplay", =>
			@progressBar.max = Math.round(@videolayer.player.duration)

		# scrubbing performs kind of shitty on an iPhone
		# and none of this is that great with very large videos
		@progressBar.on "change:value", =>
			if @isPlaying then @videolayer.player.currentTime = @progressBar.value
		@progressBar.knob.on Events.DragStart, =>
			@isScrubbing = true
			if @isPlaying then @videolayer.player.pause()
		@progressBar.knob.on Events.DragEnd, =>
			@isScrubbing = false
			@videolayer.player.currentTime = @progressBar.value
			if @isPlaying then @videolayer.player.play()

	setShyPlayButton: (shyPlayButton) ->
		@_shyPlayButton = shyPlayButton
	fadePlayButton: () ->
		@fadeButtonAnimation = new Animation
			layer: @playcontrol
			properties:
				opacity: 0
			time: 2
		@fadeButtonAnimation.start()

	setShyControls: (shyControls) ->
		@_shyControls = shyControls
	fadeControls: () ->
		for layer, index in @controlsArray
			@controlsAnimations[index] = new Animation
				layer: layer
				properties:
					opacity: 0
				time: 2
			@controlsAnimations[index].start()
		
	setTimeElapsed: (showTimeElapsed) ->
		@_showTimeElapsed = showTimeElapsed

		if showTimeElapsed is true
			@timeElapsed = new Layer
				backgroundColor: "transparent"
				name: "currentTime"
			@controlsArray.push @timeElapsed

			@timeElapsed.style = @timeStyle
			@timeElapsed.html = "0:00"

			Events.wrap(@videolayer.player).on "timeupdate", =>
				@timeElapsed.html = @videolayer.formatTime()

	setTimeLeft: (showTimeLeft) =>
		@_showTimeLeft = showTimeLeft

		if showTimeLeft is true
			@timeLeft = new Layer
				backgroundColor: "transparent"
				name: "timeLeft"
			@controlsArray.push @timeLeft

			@timeLeft.style = @timeStyle

			@timeLeft.html = "-0:00"
			Events.wrap(@videolayer.player).on "loadedmetadata", =>
				@timeLeft.html = "-" + @videolayer.formatTimeLeft()

			Events.wrap(@videolayer.player).on "timeupdate", =>
				@timeLeft.html = "-" + @videolayer.formatTimeLeft()

	setTimeTotal: (showTimeTotal) =>
		@_showTimeTotal = showTimeTotal

		if showTimeTotal is true
			@timeTotal = new Layer
				backgroundColor: "transparent"
				name: "timeTotal"
			@controlsArray.push @timeTotal

			@timeTotal.style = @timeStyle

			@timeTotal.html = "0:00"
			Events.wrap(@videolayer.player).on "loadedmetadata", =>
				@timeTotal.html = @videolayer.formatTimeLeft()


