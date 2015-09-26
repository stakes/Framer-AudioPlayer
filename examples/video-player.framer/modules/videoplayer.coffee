class exports.VideoPlayer extends Layer

	constructor: (options={}) ->

		@controlheight = 80
		@videowidth = if options.fullscreen then Screen.width else options.width
		@videoheight = if options.fullscreen then Screen.height else options.height


		# here's our container layer
		super
			width: @videowidth + 15
			height: @videoheight + 15
			backgroundColor: null

		# create the videolayer
		@videolayer = new VideoLayer
			width: @videowidth
			height: @videoheight
			superLayer: @
			backgroundColor: null

		# create play/pause button
		@playcontrol = new Layer
			width: @controlheight
			height: @controlheight
			superLayer: @
			backgroundColor: null
		@playcontrol.y = @videolayer.height
		@playcontrol.showPlay = -> @image = "images/play.png"
		@playcontrol.showPause = -> @image = "images/pause.png"
		@playcontrol.showPlay()
		@playcontrol.center()

		# play/pause button event listening
		@playcontrol.on Events.Click, =>
			if @videolayer.player.paused
				@_currentlyPlaying = true
				@videolayer.player.play()
			else
				@_currentlyPlaying = false
				@videolayer.player.pause()

		# videolayer event listening
		Events.wrap(@videolayer.player).on "pause", =>
			@playcontrol.showPlay()
		Events.wrap(@videolayer.player).on "play", =>
			@playcontrol.showPause()
		Events.wrap(@videolayer.player).on "ended", =>
			# do nothing yet
		Events.wrap(@videolayer.player).on "timeupdate", =>
			# do nothing here yet

		@videolayer.video = options.video

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

	@define 'isPlaying',
		get: -> @_currentlyPlaying

	setProgress: (showProgress) ->
		@_showProgress = showProgress

		@progressBar = new SliderComponent
			width: @videolayer.width
			height: 10
			y: @videolayer.height - 10
			backgroundColor: '#ccc'
			min: 0
			value: 0
			superLayer: @

		@progressBar.knob.draggable.momentum = false

		Events.wrap(@videolayer.player).on "timeupdate", =>
			@progressBar.knob.midX = @progressBar.pointForValue(@videolayer.player.currentTime)
		Events.wrap(@videolayer.player).on "canplay", =>
			@progressBar.max = Math.round(@videolayer.player.duration)

		# this performs so shitty on an iPhone
		# @progressBar.on "change:value", =>
		# 	if @isPlaying then @videolayer.player.currentTime = @progressBar.value
		@progressBar.knob.on Events.DragStart, =>
			if @isPlaying then @videolayer.player.pause()
		@progressBar.knob.on Events.DragEnd, =>
			print "end"
			@videolayer.player.currentTime = @progressBar.value
			if @isPlaying then @videolayer.player.play()



