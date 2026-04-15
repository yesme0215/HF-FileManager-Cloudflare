const SESSION_COOKIE = 'hf_manager_session';
const VALID_SESSION = 'authenticated';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 【关键】明确放行所有登录相关的路径和静态资源
  if (
    path === '/login.html' ||
    path === '/login.js' ||
    path === '/style.css' ||
    path === '/api/login' ||
    path === '/config'
  ) {
    return context.next();
  }

  // 其他路径才进行登录校验
  const cookie = request.headers.get('Cookie') || '';
  const hasValidSession = cookie.split(';').some(c => 
    c.trim() === `${SESSION_COOKIE}=${VALID_SESSION}`
  );

  if (hasValidSession) {
    return context.next();
  } else {
    // 未登录，重定向到登录页
    return Response.redirect(`${url.origin}/login.html`, 302);
  }
}
