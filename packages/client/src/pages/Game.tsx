import { useEffect } from "react"
import Phaser from "phaser"

import { fpsLimit } from "@superworms/server/src/util"

import { GameScene } from "../scenes/GameScene"

function Game({ username }: { username: string }) {
	let game: Phaser.Game

	useEffect(() => {
		if (game) return

		game = new Phaser.Game({
			type: Phaser.AUTO,
			title: "SuperWorms Client",
			parent: "game-container",
			width: 1920,
			height: 1080,
			pixelArt: false,
			scene: [GameScene],
			scale: {
				mode: Phaser.Scale.RESIZE,
				autoCenter: Phaser.Scale.CENTER_BOTH
			},
			fps: {
				limit: fpsLimit
			}
		})
	}, [])

	return <></>
}

export default Game
