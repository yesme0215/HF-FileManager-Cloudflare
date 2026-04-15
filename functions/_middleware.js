export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // ========== 白名单：永远放行 ==========
  const allowed = [
    "/login.html",
    "/login.js",
    "/style.css",
    "/api/login",
    "/config"
  ];

  if (allowed.includes(path)) {
    return context.next();
  }

  // ========== 校验登录态 ==========
  const cookie = request.headers.get("cookie") || "";
  const hasSession = cookie.includes("hf_manager_session=authenticated");

  if (hasSession) {
    return context.next();
  }

  // ========== 未登录 → 跳登录（只跳一次，绝对不循环） ==========
  return Response.redirect(`${url.origin}/login.html`, 302);
}
