class Discord {
	/**
	 * Temporary-ish solution of storing user tokens in memory to prevent rate limits
	 * ClientID <-> Auth Token
	 */
	authTokens = new Map<string, string>()

	/**
	 * Temporary-ish solution of storing user refresh tokens in memory to prevent rate limits
	 * Access Token <-> Refresh Token
	 */
	refreshTokens = new Map<string, { refresh_token: string; renew_at: number }>()

	/**
	 * Exchange client-side code for an auth token and save the refresh token
	 * @param code Code from the redirect url
	 * @returns Access Token
	 */
	async exchangeCode(code: string) {
		const response = (await fetch(`https://discord.com/api/oauth2/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID!,
				client_secret: process.env.DISCORD_CLIENT_SECRET!,
				grant_type: "authorization_code",
				code: code
			})
		}).catch((e) => console.error(e))) as Response

		const { access_token, refresh_token, expires_in } = await response.json()
		this.refreshTokens.set(access_token, { refresh_token, renew_at: new Date().setUTCSeconds(new Date().getUTCSeconds() + expires_in) })

		return access_token
	}

	async getUserData(access_token: string) {
		const user = await (
			(await fetch(`https://discord.com/api/users/@me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					Authorization: `Bearer ${access_token}`
				}
			}).catch((e) => console.error(e))) as Response
		).json()

		if (!user.id) throw ""
		this.authTokens.set(user.id, access_token)

		return user
	}
}

export const discord = new Discord()
