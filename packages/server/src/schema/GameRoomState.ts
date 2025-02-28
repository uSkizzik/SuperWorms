import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema"
import { normalSpeed } from "../util/const"

export class OrbState extends Schema {
	@type("number") x: number = 0
	@type("number") y: number = 0

	@type("number") score: number = 1
	@type("number") color: number = 0xff0000
}

export class PlayerState extends Schema {
	@type("number") angle: number = 0
	@type("number") x: number = 0
	@type("number") y: number = 0

	@type("number") speed: number = normalSpeed
}

export class GameRoomState extends Schema {
	@type({ array: OrbState }) orbs = new ArraySchema<OrbState>()
	@type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
