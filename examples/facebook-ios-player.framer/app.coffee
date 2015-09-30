# Made with Framer
# By Jay Stakelon
# www.framerjs.com

# This imports all the layers for "facebook" into facebookLayers
imports = Framer.Importer.load "imported/facebook"

# Set device background 
Framer.Device.background.style.background = 
	"linear-gradient(0deg, #384778 0%, #4f6ba5 100%)"
	
Framer.Defaults.Animation =
	curve: "ease-out"
	time: .3

{VideoPlayer} = require "videoplayer"
{Bars} = require "bars"

# we'll add all of our controls to this later
detailControlsArray = [imports.hd]

# setup and static elements
isFeed = true
isControlsShowing = false
detailBg = new Layer
	width: Screen.width
	height: Screen.height
	backgroundColor: "#000"
	opacity: 0
detailControls = new Layer
	width: 750, height: 100, maxY: Screen.height, opacity: 0
	image: "images/overlay-detail.png"
doneButton = new Layer
	width: 104, height: 54, maxX: Screen.width-30, y: 50, opacity: 0
	image: "images/done.png"
overlayControlsArray = [detailControls, doneButton]

# create and position the VideoPlayer
video = new VideoPlayer
	video: "video-480.m4v"
	width: 735
	height: 412
	constrainToButton: true
	autoplay: true
	muted: true
video.centerX()
video.y = 782
video.originalFrame = video.frame

# put a drop shadow on the feed video
video.shadowColor = "rgba(0,0,0,.5)"
video.shadowY = 4
video.shadowBlur = 10

# set play and pause button images
video.playButtonImage = "images/fb-playbutton.png"
video.pauseButtonImage = "images/fb-pausebutton.png"
video.playButton.width = video.playButton.height = 42
video.playButton.visible = false
video.playButton.x = 20

# make bouncy bars in the feed
bars = new Bars
	barPadding: 2
	barWith: 8
bars.maxX = video.maxX - 10
bars.maxY = video.maxY - 10
bars.opacity = .7

# transition from feed to detail view
toDetailView = ->
	isFeed = false
	video.player.muted = false
	unless video.isPlaying then video.player.play()
	video.animate
		properties:
			x: 0
			midY: Screen.height/2
			width: 750
			height: 422
			shadowY: 0
			shadowBlur: 0
		curve: "spring(200,22,1)"
	video.videoLayer.animate
		properties:
			width: 750
			height: 422
	bars.opacity = 0
	detailBg.scaleY = 0
	detailBg.opacity = 1
	detailBg.animate
		properties:
			scaleY: 1
	for layer in overlayControlsArray
		layer.animateStop()
		layer.animate
			delay: .3
			time: .1
			properties: 
				opacity: 1
	isControlsShowing = true
	video.progressBar.y = Screen.height/2 + video.height/2 - 17
	video.timeElapsed.y = video.progressBar.y - 15
	video.timeLeft.y = video.progressBar.y - 15
	video.playButton.superLayer = null
	video.playButton.visible = true
	video.playButton.y = video.progressBar.y - 22
	imports.hd.x = 692
	imports.hd.y = video.timeLeft.y + 7
	imports.hd.bringToFront()
	video.progressBar.opacity = video.timeLeft.opacity =
		video.timeElapsed.opacity = video.playButton.opacity =
		imports.hd.opacity = 0
	showControls(true, true)
	Utils.delay .5, ->
		video.draggable.enabled = true
		video.draggable.momentum = false
		video.on Events.DragStart, startVideoDrag
		video.on Events.DragMove, moveVideoDrag
		video.on Events.DragEnd, endVideoDrag

# transition from detail view back to feed
toFeedView = ->
	isFeed = true
	video.player.muted = true
	video.animate
		properties:
			x: video.originalFrame.x
			y: video.originalFrame.y
			width:  video.originalFrame.width
			height:  video.originalFrame.height
			shadowY: 4
			shadowBlur: 10	
		curve: "spring(200,22,1)"	
	video.videoLayer.animate
		properties:
			width:  video.originalFrame.width
			height:  video.originalFrame.height
	unless video.player.paused
		bars.animate
			properties:
				opacity: .7
			delay: .25
	detailBg.animate
		properties:
			opacity: 0
	for layer in overlayControlsArray
		layer.animate
			properties: 
				opacity: 0
	hideControls()
	video.draggable.enabled = false
	video.off Events.DragStart, startVideoDrag
	video.off Events.DragMove, moveVideoDrag
	video.off Events.DragEnd, endVideoDrag
	
# instead of using shyControls = true, show controls by hand
showControls = (isDelay, skipdetailControls) ->
	isControlsShowing = true
	delay = if isDelay then .75 else 0
	controlsArray = unless skipdetailControls then detailControlsArray.concat overlayControlsArray else detailControlsArray
	for layer in controlsArray
		layer.animateStop()
		layer.animate
			delay: delay
			properties:
				opacity: 1

# instead of using shyControls = true, hide controls by hand
hideControls = ->
	isControlsShowing = false
	controlsArray = detailControlsArray.concat overlayControlsArray
	for layer in controlsArray
		layer.animateStop()
		layer.animate
			time: .1
			properties:
				opacity: 0
	
	

# manage transitions
toggleControls = ->
	if isControlsShowing then hideControls() else showControls()
video.on Events.Click, ->
	if isFeed
		toDetailView()
	else
		toggleControls()
doneButton.on Events.Click, ->
	unless isFeed then toFeedView()

# show, position and customize the progress bar
video.showProgress = true
video.progressBar.width = 420
video.progressBar.height = 2
video.progressBar.backgroundColor = "#555259"
video.progressBar.knobSize = 34
video.progressBar.borderRadius = 0
video.progressBar.knob.backgroundColor = "#fff"
video.progressBar.fill.backgroundColor = "#fff"
video.progressBar.x = 155

# time display style should be set before showing timestamps
video.timeStyle = { "font-size": "20px", "color": "#fff" }

# show and position elapsed time
video.showTimeElapsed = true
video.timeElapsed.x = 84
 
# show and position total video time
video.showTimeLeft = true
video.timeLeft.x = video.progressBar.maxX + 28

# add controls to our array
detailControlsArray.push video.progressBar
detailControlsArray.push video.playButton
detailControlsArray.push video.timeElapsed
detailControlsArray.push video.timeLeft
layer.opacity = 0 for layer in detailControlsArray

# video drag methods for bonus points
startVideoDrag = (evt) ->
	offset = if evt.targetTouches then evt.targetTouches[0].screenY - 460 else evt.offsetY
	if offset > 320
		video.draggable.vertical = video.draggable.horizontal = 0
	else
		video.draggable.vertical = video.draggable.horizontal = 1
moveVideoDrag = (evt)->
	if isControlsShowing then hideControls()
	abs = Math.abs (video.midY - Screen.height/2)
	opacity = Utils.modulate abs, [0, 500], [1, 0]
	detailBg.opacity = opacity
endVideoDrag = ->
	if Math.abs(video.midY - Screen.height/2) > 100
		toFeedView()
	else if video.draggable.isMoving
		detailBg.animate
			properties:
				opacity: 1
			time: .1
		video.animate
			properties:
				x: 0
				midY: Screen.height/2
			curve: "spring(200,22,1)"
