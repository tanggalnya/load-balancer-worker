export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const backendServers = [
			'https://www.tanggalnya.com',
			'https://www1.tanggalnya.com',
			'https://www2.tanggalnya.com',
		];

		let index = Math.floor(Math.random() * backendServers.length);

		let proxyUrl = backendServers[index];
		let healthCheckResponse = await fetch(proxyUrl + '/ping'); // Perform health check

		if (healthCheckResponse.ok) {
			let res = await fetch(proxyUrl + url.pathname + url.search, request);

			return res;
		}

		for (let i = 1; i < backendServers.length; i++) {
			index = (index + 1) % backendServers.length;
			proxyUrl = backendServers[index];
			healthCheckResponse = await fetch(proxyUrl + '/ping');

			if (healthCheckResponse.ok) {
				let res = await fetch(proxyUrl + url.pathname + url.search, request);
				return res;
			}
		}

		return new Response('No healthy backends available', { status: 500 });
	},
};
