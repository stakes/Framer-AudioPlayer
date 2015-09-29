# This imports all the layers for "facebook" into facebookLayers
imports = Framer.Importer.load "imported/facebook"

# Set device background 
Framer.Device.background.style.background = 
	"linear-gradient(0deg, #384778 0%, #4f6ba5 100%)"

{VideoPlayer} = require "videoplayer"

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
	
detailControlsArray = [detailControls, doneButton, imports.hd]

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

toDetailView = ->
	isFeed = false
	video.player.muted = true
	video.animate
		properties:
			x: 0
			midY: Screen.height/2
			width: 750
			height: 422
			shadowY: 0
			shadowBlur: 0
	video.videolayer.animate
		properties:
			width: 750
			height: 422
	detailBg.scaleY = 0
	detailBg.opacity = 1
	detailBg.animate
		properties:
			scaleY: 1
	detailControls.animate
		properties: 
			opacity: 1
	doneButton.animate
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
	showControls()

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
	video.videolayer.animate
		properties:
			width:  video.originalFrame.width
			height:  video.originalFrame.height
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
			
showControls = ->
	isControlsShowing = true
	for layer in detailControlsArray
		layer.animateStop()
		layer.animate
			properties:
				opacity: 1
	
hideControls = ->
	isControlsShowing = false
	for layer in detailControlsArray
		layer.animateStop()
		layer.animate
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

# fade play button and controls out
# video.shyPlayButton = true
# video.shyControls = true
# listen for events to fade out overlay also
# video.on "controls:play", ->
# 	imports.overlay.animate
# 		properties:
# 			opacity: 0
# 		time: 2
# video.on "controls:pause", ->
# 	imports.overlay.animateStop()
# 	imports.overlay.opacity = 1
# video.on "video:ended", ->
# 	imports.overlay.animateStop()
# 	imports.overlay.opacity = 1

