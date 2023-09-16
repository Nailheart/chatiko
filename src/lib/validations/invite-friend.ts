import { z } from 'zod';

const inviteFriend = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }).trim(),
});

export { inviteFriend };