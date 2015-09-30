# Made with Framer
# By Jay Stakelon
# www.framerjs.com

# This imports all the layers for "youtube" into youtubeLayers
imports = Framer.Importer.load "imported/youtube"

# Set device background 
Framer.Device.background.style.background = 
	"linear-gradient(0deg, #CFD7DC 0%, #fff 100%)"

{VideoPlayer} = require "videoplayer"

# create and position the VideoPlayer
video = new VideoPlayer
	video: "framerintro.mp4"
	width: 750
	height: 422
video.centerX()

# set play and pause button images
video.playButtonImage = "images/playbutton.png"
video.pauseButtonImage = "images/pausebutton.png"
video.playButton.width = 61
video.playButton.height = 71

# move the static/inactive overlay buttons in front of the player
imports.overlay.placeBefore video

# show, position and customize the progress bar
video.showProgress = true
video.progressBar.width = 370
video.progressBar.height = 5
video.progressBar.backgroundColor = "#ccc"
video.progressBar.knobSize = 24
video.progressBar.borderRadius = 0
video.progressBar.knob.shadowColor = "transparent"
video.progressBar.knob.backgroundColor = "#E62117"
video.progressBar.fill.backgroundColor = "#E62117"
video.progressBar.x = 100
video.progressBar.y = video.height - 40

# time display style should be set before showing timestamps
video.timeStyle = { "font-size": "24px", "color": "#fff" }

# show and position elapsed time
video.showTimeElapsed = true
video.timeElapsed.x = 24
video.timeElapsed.y = video.height - 52

# show and position total video time
video.showTimeTotal = true
video.timeTotal.x = video.progressBar.maxX + 24
video.timeTotal.y = video.height - 52

# fade play button and controls out
video.shyPlayButton = true
video.shyControls = true

# listen for events to fade out static overlay also
video.on "controls:play", ->
	imports.overlay.animate
		properties:
			opacity: 0
		time: 2
video.on "controls:pause", ->
	imports.overlay.animateStop()
	imports.overlay.opacity = 1
video.on "video:ended", ->
	imports.overlay.animateStop()
	imports.overlay.opacity = 1