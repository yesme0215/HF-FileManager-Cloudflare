export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || '';

  try {
    const apiUrl = `https://huggingface.co/api/${env.HF_REPO_TYPE}/${env.HF_REPO_ID}/contents/${encodeURIComponent(path)}`;
    const res = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${env.HF_TOKEN}` }
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}