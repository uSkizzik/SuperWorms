import { colyseus } from "./Colyseus.ts"
import { DISCORD_CLIENT_ID, discord } from "./Discord.ts"

export async function authenticate() {
	if (!discord) {
		console.log("Discord instance does not exist. Continuing in web mode.")
		return
	}

	console.log("Connecting to Discord...")
	await discord.ready()

	console.log("Connected to Discord, authorizing...")

	// Authorize with Discord Client
	const { code } = await discord.commands.authorize({
		client_id: DISCORD_CLIENT_ID,
		response_type: "code",
		state: "",
		prompt: "none",
		scope: [
			"applications.commands",

			// "applications.builds.upload",
			// "applications.builds.read",
			// "applications.store.update",
			// "applications.entitlements",
			// "bot",
			"identify",
			// "connections",
			// "email",
			// "gdm.join",
			"guilds",
			// "guilds.join",
			"guilds.members.read",
			// "messages.read",
			// "relationships.read",
			// 'rpc.activities.write',
			// "rpc.notifications.read",
			// "rpc.voice.write",
			"rpc.voice.read"
			// "webhook.incoming",
		]
	})

	// Retrieve a token and userdata from the embedded app's server
	console.log("Authorized, exchanging code for token...")
	const { data } = await colyseus.http.post("/discord_token", {
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code })
	})

	if (!data.access_token) {
		throw new Error("Server-side error")
	}

	// Authenticate with the token, so we can use the Discord API
	// This is required to listen to SPEAKING events
	console.log("Code exchanged, authenticating...")
	await discord.commands.authenticate({ access_token: data.access_token })

	return data
}
