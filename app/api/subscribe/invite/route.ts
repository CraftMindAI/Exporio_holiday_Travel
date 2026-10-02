import { sendSubscribeInvite } from '@/lib/notify';
import { fail, normalizeEmail, ok, readJson, route } from '@/lib/http';

/** POST /api/subscribe/invite - step 1 of subscribing: email the visitor the /subscribe form link. */
export const POST = route(async (req: Request) => {
  const email = normalizeEmail((await readJson(req)).email);
  if (!email) return fail('Please enter a valid email address.');

  await sendSubscribeInvite(email);
  return ok({ success: true, message: 'Check your inbox! We sent you a link to complete your subscription.' });
});
