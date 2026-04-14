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

export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const { from, to, sha } = await request.json();
    // 1. 获取原文件内容
    const original = await hfApiRequest(env, 'GET', from);
    // 2. 创建新文件
    await hfApiRequest(env, 'PUT', to, {
      message: `Rename to ${to}`,
      content: original.content
    });
    // 3. 删除原文件
    await hfApiRequest(env, 'DELETE', from, {
      message: `Remove old ${from}`,
      sha
    });
    return new Response(JSON.stringify({ success: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// 记得把 hfApiRequest 函数放在这里！