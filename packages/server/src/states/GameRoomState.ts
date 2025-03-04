import { CollectionSchema, MapSchema, Schema, type } from "@colyseus/schema"
import { OrbState } from "./OrbState"
import { PlayerState } from "./PlayerState"

export class GameRoomState extends Schema {
	@type({ collection: OrbState }) orbs = new CollectionSchema<OrbState>()
	@type({ map: PlayerState }) players = new MapSchema<PlayerState>()
}
