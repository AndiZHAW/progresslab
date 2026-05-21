import { dev } from '$app/environment';
import { error } from '@sveltejs/kit';

export function assertAdminCanMutate(user: NonNullable<App.Locals['user']>): void {
	if (user.role !== 'admin') {
		throw error(403, 'Nur Admins dürfen Übungen ändern');
	}
	if (!dev && user.username === 'admin') {
		throw error(403, 'Der öffentliche Demo-Admin ist in der Live-App read-only.');
	}
}
