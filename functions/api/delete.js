export async function onRequestDelete(context) {
  const { env, request } = context;
  const { path, sha } = await request.json();

  try {
    const res = await fetch(`https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sha, message: 'Delete file' })
    });

    if (!res.ok) throw new Error(await res.text());
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}