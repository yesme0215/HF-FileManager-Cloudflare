const SESSION_COOKIE = 'hf_manager_session';
const VALID_SESSION = 'authenticated';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const publicPaths = [
    '/login.html',
    '/login.js',
    '/style.css',
    '/api/login',
    '/config'
  ];

  if (publicPaths.includes(url.pathname)) {
    return context.next();
  }

  const cookie = request.headers.get('Cookie') || '';
  const hasSession = cookie.split(';').some(c => 
    c.trim() === `${SESSION_COOKIE}=${VALID_SESSION}`
  );

  if (hasSession) {
    return context.next();
  }

  return Response.redirect(`${url.origin}/login.html`, 302);
}