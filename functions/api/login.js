export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const { password } = body;

  if (password === env.AUTH_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'hf_manager_session=authenticated; path=/; SameSite=Lax; HttpOnly'
      }
    });
  } else {
    return new Response(JSON.stringify({ success: false, error: '密码错误' }), { status: 401 });
  }
}