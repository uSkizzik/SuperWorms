import { Schema, MapSchema, type } from "@colyseus/schema"
import { normalSpeed } from "../../util/const"

export class PlayerState extends Schema {
	@type("number") angle: number = 0
	@type("number") x: number = 0
	@type("number") y: number = 0

	@type("number") speed: number = normalSpeed
}

export class GameRoomState extends Schema {
	@type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
