import { Schema, type } from "@colyseus/schema"

export class PointState extends Schema {
	@type("number") x: number = 0
	@type("number") y: number = 0
}
