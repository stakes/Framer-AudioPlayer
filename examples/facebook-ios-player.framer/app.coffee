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

detailControlsArray = [imports.hd]

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
video.playcontrol.width = video.playcontrol.height = 42
video.playcontrol.visible = false
video.playcontrol.x = 20

# make bouncy bars in the feed
bars = new Bars
	barPadding: 2
	barWith: 8
bars.maxX = video.maxX - 10
bars.maxY = video.maxY - 10
bars.opacity = .7


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
	video.videolayer.animate
		properties:
			width: 750
			height: 422
	bars.opacity = 0
	detailBg.scaleY = 0
	detailBg.opacity = 1
	detailBg.animate
		properties:
			scaleY: 1
	detailControls.animateStop()
	detailControls.animate
		delay: .3
		time: .1
		properties: 
			opacity: 1
	doneButton.animateStop()
	doneButton.animate
		delay: .3
		time: .1
		properties: 
			opacity: 1
	isControlsShowing = true
	video.progressBar.y = Screen.height/2 + video.height/2 - 17
	video.timeElapsed.y = video.progressBar.y - 15
	video.timeLeft.y = video.progressBar.y - 15
	video.playcontrol.superLayer = null
	video.playcontrol.visible = true
	video.playcontrol.y = video.progressBar.y - 22
	imports.hd.x = 692
	imports.hd.y = video.timeLeft.y + 7
	imports.hd.bringToFront()
	video.progressBar.opacity = video.timeLeft.opacity =
		video.timeElapsed.opacity = video.playcontrol.opacity =
		imports.hd.opacity = 0
	showControls(true)

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
	video.videolayer.animate
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
	detailControls.animate
		properties: 
			opacity: 0
	doneButton.animate
		properties: 
			opacity: 0
	hideControls()
			
showControls = (isDelay) ->
	isControlsShowing = true
	delay = if isDelay then .75 else 0
	for layer in detailControlsArray
		layer.animateStop()
		layer.animate
			delay: delay
			properties:
				opacity: 1
	
hideControls = ->
	isControlsShowing = false
	for layer in detailControlsArray
		layer.animateStop()
		layer.animate
			time: .1
			properties:
				opacity: 0

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

detailControlsArray.push video.progressBar
detailControlsArray.push video.playcontrol
detailControlsArray.push video.timeElapsed
detailControlsArray.push video.timeLeft

# fade controls out by hand
# video.on "controls:play", ->
# 	imports.overlay.animate
# 		properties:
# 			opacity: 0
# 		time: 2


