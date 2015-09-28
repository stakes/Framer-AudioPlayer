# Set default cursor
document.body.style.cursor = "auto"

bg = new BackgroundLayer
	backgroundColor: "#fff"

{VideoPlayer} = require "videoplayer"

player = new VideoPlayer
	video: "video.mp4"
	width: 700
	height: 394
	
player.centerX()
player.centerY(-50)

player.showProgress = true
player.progressBar.centerX()
player.progressBar.centerY player.height/2

player.showTimeElapsed = true
player.timeElapsed.x = player.x + 50
player.timeElapsed.centerY player.height/2 + 35

player.showTimeLeft = true
player.timeLeft.maxX = player.maxX
player.timeLeft.centerY player.height/2 + 35

player.shyPlayButton = true
player.shyControls = true