const SESSION_COOKIE = 'hf_manager_session';
const VALID_SESSION = 'authenticated';

export async function onRequest(context) {
  const { request, env } = context; // ✅ 从 context 里拿到 env
  const AUTH_PASSWORD = env.AUTH_PASSWORD; // ✅ 正确获取环境变量
  const url = new URL(request.url);

  // 放行登录相关路径
  if (url.pathname === '/login.html' || url.pathname === '/login.js' || url.pathname === '/style.css' || url.pathname === '/login') {
    return context.next();
  }

  // 检查会话 Cookie
  const cookie = request.headers.get('Cookie') || '';
  const hasValidSession = cookie.split(';').some(c => c.trim() === `${SESSION_COOKIE}=${VALID_SESSION}`);

  if (hasValidSession) {
    return context.next();
  }

  // 未登录，跳转到登录页
  return Response.redirect(`${url.origin}/login.html`, 302);
}