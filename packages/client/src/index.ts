import Phaser from "phaser"
import { Game } from "./scenes/Game"

const config = {
	type: Phaser.AUTO,
	title: "SuperWorms Client",
	parent: "game-container",
	width: 1920,
	height: 1080,
	pixelArt: false,
	scene: [Game],
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH
	}
}
new Phaser.Game(config)
