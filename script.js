let currentPath = '';
let config = {
  repoType: 'models',
  repoId: '',
  hfMirror: 'https://hf-mirror.com'
};

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadConfig();
    await refresh();
  } catch (e) {
    console.error(e);
    showError('初始化失败，请检查环境变量');
  }
});

async function loadConfig() {
  const res = await fetch('/config');
  if (!res.ok) throw new Error('Config load failed');
  const data = await res.json();
  config = { ...config, ...data };
  const repoInfo = document.getElementById('repoInfo');
  if (repoInfo) repoInfo.textContent = `${config.repoType}/${config.repoId}`;
}

function showLoading(show) {
  const el = document.getElementById('loading');
  if (el) el.classList.toggle('hidden', !show);
}

function showError(msg) {
  const el = document.getElementById('error');
  if (el) {
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
  }
}

// ... 后面的代码保持原样，不要动 ...

async function refresh() {
  showLoading(true);
  try {
    const res = await fetch(`/api/list?path=${encodeURIComponent(currentPath)}`);
    if (!res.ok) throw new Error((await res.json()).error);
    const files = await res.json();
    renderBreadcrumb();
    renderFileList(files);
  } catch (e) {
    showError(e.message);
  } finally {
    showLoading(false);
  }
}

function renderBreadcrumb() {
  const parts = currentPath.split('/').filter(Boolean);
  let html = '<a href="#" onclick="navigateTo(\'\');return false;">🏠 根目录</a>';
  let p = '';
  parts.forEach(part => {
    p += (p ? '/' : '') + part;
    html += ` / <a href="#" onclick="navigateTo('${p}');return false;">${part}</a>`;
  });
  document.getElementById('breadcrumb').innerHTML = html;
}

function renderFileList(files) {
  const list = document.getElementById('fileList');
  list.innerHTML = '';

  files.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });

  files.forEach(file => {
    if (file.name === '.gitkeep') return;
    const isDir = file.type === 'dir';
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
    const item = document.createElement('div');
    item.className = 'file-item';

    let thumb = '';
    if (isImage) {
      const url = `${config.hfMirror}/${config.repoType}/${config.repoId}/resolve/main/${file.path}`;
      thumb = `<img src="${url}" class="thumbnail" alt="">`;
    }

    item.innerHTML = `
      ${thumb}
      <div class="name">${isDir ? '📁 ' : '📄 '}${file.name}</div>
      <div class="actions">
        ${isDir ? `<button onclick="navigateTo('${file.path}')">进入</button>` : ''}
        <button onclick="renameFile('${file.path}','${file.sha}')">重命名</button>
        <button onclick="moveFile('${file.path}','${file.sha}')">移动</button>
        <button onclick="deleteFile('${file.path}','${file.sha}')">删除</button>
        ${!isDir ? `<a href="${config.hfMirror}/${config.repoType}/${config.repoId}/resolve/main/${file.path}" target="_blank">打开</a>` : ''}
        ${!isDir ? `<button onclick="copyLink('${file.path}')">复制链接</button>` : ''}
      </div>
    `;
    list.appendChild(item);
  });
}

function navigateTo(path) {
  currentPath = path;
  refresh();
}

async function uploadFiles() {
  const input = document.getElementById('fileInput');
  if (!input.files.length) return;
  showLoading(true);
  try {
    for (const file of input.files) {
      const form = new FormData();
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      form.append('file', file);
      form.append('path', fullPath);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error((await res.json()).error);
    }
    input.value = '';
  } catch (e) {
    showError(e.message);
  } finally {
    showLoading(false);
    refresh();
  }
}

async function createFolder() {
  const name = prompt('文件夹名称：');
  if (!name) return;
  const path = currentPath ? `${currentPath}/${name}` : name;
  try {
    const res = await fetch('/api/mkdir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    refresh();
  } catch (e) {
    showError(e.message);
  }
}

async function renameFile(path, sha) {
  const old = path.split('/').pop();
  const name = prompt('新名称：', old);
  if (!name || name === old) return;
  const newPath = path.replace(/[^/]+$/, name);
  try {
    const res = await fetch('/api/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: path, to: newPath, sha })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    refresh();
  } catch (e) {
    showError(e.message);
  }
}

async function moveFile(path, sha) {
  const defaultDir = currentPath || '';
  const newDir = prompt('移动到目录（留空则为根目录）：', defaultDir);
  if (newDir === null) return;

  const fileName = path.split('/').pop();
  const newPath = newDir === '' ? fileName : `${newDir}/${fileName}`;

  try {
    const res = await fetch('/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: path, to: newPath, sha })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    refresh();
  } catch (e) {
    showError(e.message);
  }
}

async function deleteFile(path, sha) {
  if (!confirm('确定删除？')) return;
  try {
    const res = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, sha })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    refresh();
  } catch (e) {
    showError(e.message);
  }
}

function copyLink(path) {
  const url = `${config.hfMirror}/${config.repoType}/${config.repoId}/resolve/main/${path}`;
  navigator.clipboard.writeText(url).then(() => alert('已复制')).catch(() => prompt('链接：', url));
}
