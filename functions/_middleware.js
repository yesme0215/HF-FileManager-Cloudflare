const SESSION_COOKIE = 'hf_manager_session';
const VALID_SESSION = 'authenticated';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 只放行登录相关的资源
  const publicPaths = [
    '/login.html',
    '/login.js',
    '/style.css',
    '/api/login',
    '/config'
  ];

  if (publicPaths.includes(path)) {
    return context.next();
  }

  // 检查 Cookie
  const cookie = request.headers.get('Cookie') || '';
  const hasValidSession = cookie.split(';').some(c => 
    c.trim() === `${SESSION_COOKIE}=${VALID_SESSION}`
  );

  if (hasValidSession) {
    return context.next();
  }

  // 未登录，强制跳转
  return Response.redirect(`${url.origin}/login.html`, 302);
}
