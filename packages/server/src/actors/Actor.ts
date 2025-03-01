export abstract class Actor {
	static actors: Actor[] = []

	protected constructor() {
		Actor.actors.push(this)
	}

	destroy() {
		Actor.actors = Actor.actors.filter((a: Actor) => a === this)
	}

	tick(): any {}
}
