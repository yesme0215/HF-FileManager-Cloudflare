// 通用 HF API 请求函数
async function hfApiRequest(env, method, path, body = null) {
  const { HF_TOKEN, HF_REPO_TYPE, HF_REPO_ID } = env;
  const typePrefix = HF_REPO_TYPE === 'models' ? 'repos' : HF_REPO_TYPE;
  const url = `https://huggingface.co/api/${typePrefix}/${HF_REPO_ID}/contents/${path}`;
  
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`HF API Error (${res.status}): ${error}`);
  }
  return res.json();
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const path = new URL(request.url).searchParams.get('path') || '';
  
  try {
    const data = await hfApiRequest(env, 'GET', path);
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 记得把上面的 hfApiRequest 函数放在这里！