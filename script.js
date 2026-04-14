let config = {};
let currentPath = '';

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await refresh();
});

// 加载配置
async function loadConfig() {
  const res = await fetch('/config');
  config = await res.json();
  document.getElementById('repoInfo').textContent = `${config.repoType}/${config.repoId}`;
}

// 显示/隐藏加载状态
function showLoading(show) {
  document.getElementById('loading').classList.toggle('hidden', !show);
}

// 显示错误
function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
}

// 刷新文件列表
async function refresh() {
  showLoading(true);
  document.getElementById('error').classList.add('hidden');
  
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

// 渲染面包屑
function renderBreadcrumb() {
  const parts = currentPath.split('/').filter(Boolean);
  let html = '<a href="#" onclick="navigateTo(\'\'); return false;">🏠 根目录</a>';
  let path = '';
  
  parts.forEach(part => {
    path += (path ? '/' : '') + part;
    html += ' / ';
    html += `<a href="#" onclick="navigateTo('${path}'); return false;">${part}</a>`;
  });
  
  document.getElementById('breadcrumb').innerHTML = html;
}

// 渲染文件列表
function renderFileList(files) {
  const list = document.getElementById('fileList');
  list.innerHTML = '';
  
  // 排序：文件夹在前，文件在后
  files.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'dir' ? -1 : 1;
  });
  
  files.forEach(file => {
    if (file.name === '.gitkeep') return; // 隐藏占位文件
    
    const item = document.createElement('div');
    item.className = 'file-item';
    
    const isDir = file.type === 'dir';
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
    
    let content = '';
    
    // 图片缩略图
    if (isImage) {
      const url = `${config.hfMirror}/${config.repoType}/${config.repoId}/resolve/main/${file.path}`;
      content = `<img src="${url}" class="thumbnail" alt="${file.name}">`;
    }
    
    content += `
      <div class="icon">${isDir ? '📁' : (isImage ? '🖼️' : '📄')}</div>
      <div class="name">${file.name}</div>
      <div class="actions">
        ${isDir ? `<button onclick="navigateTo('${file.path}')">进入</button>` : ''}
        <button onclick="renameFile('${file.path}', '${file.sha}')">重命名</button>
        <button onclick="deleteFile('${file.path}', '${file.sha}')">删除</button>
        ${!isDir ? `<a href="${config.hfMirror}/${config.repoType}/${config.repoId}/resolve/main/${file.path}" target="_blank">打开</a>` : ''}
        ${!isDir ? `<button onclick="copyLink('${file.path}')">复制链接</button>` : ''}
      </div>
    `;
    
    item.innerHTML = content;
    list.appendChild(item);
  });
}

// 导航到路径
function navigateTo(path) {
  currentPath = path;
  refresh();
}

// 上传文件
async function uploadFiles() {
  const input = document.getElementById('fileInput');
  if (!input.files.length) return;
  
  showLoading(true);
  
  for (const file of input.files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
      formData.append('path', fullPath);
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error((await res.json()).error);
    } catch (e) {
      showError(`上传 ${file.name} 失败: ${e.message}`);
    }
  }
  
  input.value = '';
  await refresh();
}

// 创建文件夹
async function createFolder() {
  const name = prompt('请输入文件夹名称:');
  if (!name) return;
  
  const path = currentPath ? `${currentPath}/${name}` : name;
  
  try {
    const res = await fetch('/api/mkdir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await refresh();
  } catch (e) {
    showError(e.message);
  }
}

// 重命名文件
async function renameFile(path, sha) {
  const oldName = path.split('/').pop();
  const newName = prompt('请输入新名称:', oldName);
  if (!newName || newName === oldName) return;
  
  const newPath = path.replace(/[^/]+$/, newName);
  
  try {
    const res = await fetch('/api/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: path, to: newPath, sha })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await refresh();
  } catch (e) {
    showError(e.message);
  }
}

// 删除文件
async function deleteFile(path, sha) {
  if (!confirm(`确定要删除 "${path}" 吗？`)) return;
  
  try {
    const res = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, sha })
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await refresh();
  } catch (e) {
    showError(e.message);
  }
}

// 复制链接
async function copyLink(path) {
  const url = `${config.hfMirror}/${config.repoType}/${config.repoId}/resolve/main/${path}`;
  try {
    await navigator.clipboard.writeText(url);
    alert('链接已复制到剪贴板！');
  } catch (e) {
    prompt('请手动复制链接:', url);
  }
}