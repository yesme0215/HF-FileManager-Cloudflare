export async function onRequestGet(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    repoType: env.HF_REPO_TYPE || 'models',
    repoId: env.HF_REPO_ID,
    hfMirror: env.HF_MIRROR || 'https://hf-mirror.com'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}