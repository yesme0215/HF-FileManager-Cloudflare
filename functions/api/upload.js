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

const MAX_SMALL_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function onRequestPost(context) {
  const { env, request } = context;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const path = formData.get('path') || file.name;
    
    if (file.size > MAX_SMALL_FILE_SIZE) {
      throw new Error(`文件过大 (${(file.size/1024/1024).toFixed(2)}MB)，请使用 Hugging Face CLI 上传大文件`);
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    await hfApiRequest(env, 'PUT', path, {
      message: `Upload ${path} via HF-FileManager`,
      content
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// 记得把 hfApiRequest 函数放在这里！