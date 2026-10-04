import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	EXCHANGE_SEED: {
		description: 'Secret seed that determines the gift assignment shuffle'
	},
	PARTICIPANTS: {
		description: 'Comma-separated Name:code pairs for the gift exchange'
	}
});
