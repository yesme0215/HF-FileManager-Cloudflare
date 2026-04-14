export async function onRequestPost(context) {
  const { env, request } = context;
  const { from, to, sha } = await request.json();

  try {
    const getRes = await fetch(`https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(from)}`, {
      headers: { Authorization: `Bearer ${env.HF_TOKEN}` }
    });
    const file = await getRes.json();

    await fetch(`https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(to)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: `Move to ${to}`, content: file.content })
    });

    await fetch(`https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(from)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sha, message: 'Move: remove old' })
    });

    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}