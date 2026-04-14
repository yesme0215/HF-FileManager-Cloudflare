const SESSION_COOKIE = 'hf_manager_session';
const VALID_SESSION = 'authenticated'; // 简单会话标识

export async function onRequest(context) {
  const { request, env } = context;
  const AUTH_PASSWORD = env.AUTH_PASSWORD; // 从环境变量读取密码
  const url = new URL(request.url);

  // 放行登录页面和登录接口
  if (url.pathname === '/login' || url.pathname === '/login.js' || url.pathname === '/style.css') {
    return context.next();
  }

  // 检查 Cookie
  const cookie = request.headers.get('Cookie') || '';
  const session = cookie.split(';').find(c => c.trim().startsWith(SESSION_COOKIE));
  
  if (session && session.includes(VALID_SESSION)) {
    return context.next();
  }

  // 未登录，跳转到登录页
  return Response.redirect(`${url.origin}/login`, 302);
}