
// This is a mock auth hook.
// In a real app, you would use a real auth provider.
import { users } from '@/lib/data';
import { Role } from '@/lib/types';

// For now, let's just assume the first user is logged in.
// You can change this to test different roles.
const MOCK_USER_ID = 'user-1'; // user-1: Admin, user-2: Back-Office, user-3: Agent

export function useAuth() {
  const user = users.find(u => u.id === MOCK_USER_ID) || users[0];
  return {
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as Role
    },
    loading: false,
  };
}
