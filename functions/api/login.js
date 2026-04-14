export async function onRequestPost(context) {
  const { request, env } = context;
  const { password } = await request.json();

  if (password === env.AUTH_PASSWORD) {
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'hf_manager_session=authenticated; Path=/; HttpOnly; SameSite=Lax'
      }
    });
  } else {
    return new Response(JSON.stringify({ success: false, error: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}