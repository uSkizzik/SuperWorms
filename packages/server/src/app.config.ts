import { JWT } from "@colyseus/auth"
import config from "@colyseus/tools"
import { monitor } from "@colyseus/monitor"
import { playground } from "@colyseus/playground"

import { discord } from "./managers/Discord.ts"

import { LobbyRoom } from "./rooms/LobbyRoom"
import { GameRoom } from "./rooms/GameRoom"

export default config({
	options: {
		devMode: true
	},

	initializeGameServer: (gameServer) => {
		gameServer.define("lobby_room", LobbyRoom)
		gameServer.define("game_room", GameRoom)
	},

	initializeExpress: (app) => {
		// Discord Embedded SDK: Retrieve user token when embedded
		app.post("/discord_token", async (req, res) => {
			if (process.env.NODE_ENV !== "production" && req.body.code === "mock_code") {
				const user = {
					id: Math.random().toString(36).slice(2, 10),
					username: `User ${Math.random().toString().slice(2, 10)}`
				}

				res.send({ access_token: "mocked", token: await JWT.sign(user), user })
				return
			}

			try {
				const access_token = await discord.exchangeCode(req.body.code)
				const user = await discord.getUserData(access_token)

				res.send({
					access_token,
					token: await JWT.sign(user),
					user
				})
			} catch (e: any) {
				res.status(400).send({ error: e })
			}
		})

		/**
		 * Use @colyseus/playground
		 * (It is not recommended to expose this route in a production environment)
		 */
		if (process.env.NODE_ENV !== "production") {
			app.use("/", playground())
		}

		/**
		 * Use @colyseus/monitor
		 * It is recommended to protect this route with a password
		 * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
		 */
		app.use("/colyseus", monitor())
	},

	beforeListen: () => {
		/**
		 * Before before gameServer.listen() is called.
		 */
	}
})
