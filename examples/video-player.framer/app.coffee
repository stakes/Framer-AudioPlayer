# Made with Framer
# By Jay Stakelon
# www.framerjs.com

# Set default cursor
document.body.style.cursor = "auto"

bg = new BackgroundLayer
	backgroundColor: "#fff"

{VideoPlayer} = require "videoplayer"

video = new VideoPlayer
	video: "video.mp4"
	width: 700
	height: 394

video.centerX()
video.centerY(-50)

video.showProgress = true
video.progressBar.centerX()
video.progressBar.centerY video.height/2

video.showTimeElapsed = true
video.timeElapsed.x = video.x + 50
video.timeElapsed.centerY video.height/2 + 35

video.showTimeLeft = true
video.timeLeft.maxX = video.maxX
video.timeLeft.centerY video.height/2 + 35

video.shyPlayButton = true
video.player.loop = true