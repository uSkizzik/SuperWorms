import { PlayerState } from "../schema/GameRoomState"

export function calcPlayerMovement(
	player:
		| PlayerState
		| {
				angle: number
				speed: number
				headPos: {
					x: number
					y: number
				}
		  },
	ptr?: {
		x: number
		y: number
	}
) {
	let { angle, speed, x: playerX, y: playerY, headPos } = player

	const dx = ptr?.x - (headPos?.x ?? playerX)
	const dy = ptr?.y - (headPos?.y ?? playerY)

	if ((ptr && Math.abs(dx) > 1) || Math.abs(dy) > 1) {
		angle = Math.atan2(dy, dx)
	}

	const newX = (headPos?.x ?? playerX) + (speed / 100) * Math.cos(player.angle)
	const newY = (headPos?.y ?? playerY) + (speed / 100) * Math.sin(player.angle)

	player.angle = angle

	if (player instanceof PlayerState) {
		player.x = newX
		player.y = newY
	} else {
		player.headPos.x = newX
		player.headPos.y = newY
	}
}

export * from "./const"
