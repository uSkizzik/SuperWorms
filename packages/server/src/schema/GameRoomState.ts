import * as crypto from "crypto"

import { Schema, MapSchema, type, CollectionSchema } from "@colyseus/schema"

import { normalSpeed } from "../util"

export class OrbState extends Schema {
	@type("string") id = crypto.randomUUID()

	@type("number") x: number = 0
	@type("number") y: number = 0

	@type("number") score: number = 1
	@type("number") color: number = 0xff0000
}

export class PlayerState extends Schema {
	@type("number") angle: number = 0
	@type("number") x: number = 0
	@type("number") y: number = 0

	@type("boolean") isSprinting: boolean = false
	@type("number") speed: number = normalSpeed

	@type("number") score: number = 10
}

export class GameRoomState extends Schema {
	@type({ collection: OrbState }) orbs = new CollectionSchema<OrbState>()
	@type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
