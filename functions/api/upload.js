export async function onRequestPost(context) {
  const { env, request } = context;
  const formData = await request.formData();
  const file = formData.get('file');
  const path = formData.get('path');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const res = await fetch(`https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Upload ${path}`,
        content
      })
    });

    if (!res.ok) throw new Error(await res.text());
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}