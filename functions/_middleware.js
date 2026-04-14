const SESSION_COOKIE = 'hf_manager_session';
const VALID_SESSION = 'authenticated';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 1. 放行所有静态资源和登录相关路径
  if (
    path === '/' ||
    path === '/index.html' ||
    path === '/login.html' ||
    path === '/login.js' ||
    path === '/style.css' ||
    path === '/config' ||
    path.startsWith('/api/login')
  ) {
    return context.next();
  }

  // 2. 检查会话 Cookie
  const cookie = request.headers.get('Cookie') || '';
  const hasValidSession = cookie.split(';').some(c => 
    c.trim() === `${SESSION_COOKIE}=${VALID_SESSION}`
  );

  // 3. 未登录且访问非公共路径，跳转到登录页
  if (!hasValidSession) {
    return Response.redirect(`${url.origin}/login.html`, 302);
  }

  // 4. 已登录，正常访问
  return context.next();
}
