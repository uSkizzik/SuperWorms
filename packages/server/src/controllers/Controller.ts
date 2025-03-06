export abstract class Controller {
	static controllers: Controller[] = []

	protected constructor() {
		Controller.controllers.push(this)
	}

	destroy() {
		Controller.controllers = Controller.controllers.filter((a: Controller) => a !== this)
	}

	/**
	 * Called on every server tick which happens on a set tick rate
	 */
	tick(): any {}
}
