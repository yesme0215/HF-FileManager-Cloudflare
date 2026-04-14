export async function onRequestPost(context) {
  const { env, request } = context;
  const { path } = await request.json();
  const placeholder = `${path}/.gitkeep`;

  try {
    await fetch(`https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(placeholder)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Create dir ${path}`,
        content: btoa('')
      })
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}