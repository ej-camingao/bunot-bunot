import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { findParticipant, getGiftee, getParticipantNames, verifyCode } from '#lib/server/exchange.js';

export const load: PageServerLoad = () => {
	return {
		names: getParticipantNames()
	};
};

export const actions: Actions = {
	reveal: async ({ request }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const code = String(data.get('code') ?? '').trim();

		if (!name) {
			return fail(400, {
				name,
				code: '',
				error: 'Pick your name first.'
			});
		}

		const participant = findParticipant(name);
		if (!participant) {
			return fail(400, {
				name,
				code: '',
				error: 'That name is not on the list.'
			});
		}

		if (!code) {
			return fail(400, {
				name: participant.name,
				code: '',
				error: `Enter the code we sent you for ${participant.name}.`
			});
		}

		if (!verifyCode(participant.name, code)) {
			return fail(400, {
				name: participant.name,
				code: '',
				error: `That code doesn't match ${participant.name}. Check the message we sent you.`
			});
		}

		const giftee = getGiftee(participant.name);
		if (!giftee) {
			return fail(500, {
				name: participant.name,
				code: '',
				error: 'Something went wrong looking up your match. Try again.'
			});
		}

		return {
			name: participant.name,
			giftee
		};
	}
};
