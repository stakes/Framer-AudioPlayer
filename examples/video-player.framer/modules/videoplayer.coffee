class exports.VideoPlayer extends Layer

	constructor: (options={}) ->

		@controlheight = 80
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
				@videolayer.player.play()
			else
				@videolayer.player.pause()

		# videolayer event listening
		Events.wrap(@videolayer.player).on "pause", =>
			@playcontrol.showPlay()
		Events.wrap(@videolayer.player).on "play", =>
			@playcontrol.showPause()
		Events.wrap(@videolayer.player).on "ended", =>
			print "video ended"
		Events.wrap(@videolayer.player).on "timeupdate", =>
			print @videolayer.formatTime()
			print @videolayer.formatTimeLeft()

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

	setProgress: (showProgress) ->
		@_showProgress = showProgress

		@progressBar = new SliderComponent
			width: @videolayer.width
			height: 10
			y: @videolayer.height - 10
			backgroundColor: '#ccc'
			min: 0
			value: 0

		@progressBar.knob.draggable.momentum = false

		Events.wrap(@videolayer.player).on "timeupdate", =>
			@progressBar.knob.midX = @progressBar.pointForValue(@videolayer.player.currentTime)
		Events.wrap(@videolayer.player).on "canplay", =>
			@progressBar.max = Math.round(@videolayer.player.duration)

		@progressBar.on "change:value", =>
			@videolayer.player.currentTime = @progressBar.value



