import { Schema, type } from "@colyseus/schema"

export class PointState extends Schema {
	@type("int16") x: number = 0
	@type("int16") y: number = 0
}
