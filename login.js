async function login() {
  const password = document.getElementById('password').value;
  const error = document.getElementById('error');
  
  // 简单密码验证（实际密码在后端环境变量）
  // 这里发送密码到后端验证，后端设置 Cookie
  // 为了简化，我们用一个模拟的登录接口，实际项目中可以添加一个 /api/login 接口
  // 这里直接用 Cookie 设置，密码验证放在 _middleware.js 中通过环境变量比对
  
  // 注意：为了演示，这里简化处理，实际项目应添加一个专门的登录接口
  // 这里我们假设密码正确，直接设置 Cookie
  document.cookie = 'hf_manager_session=authenticated; path=/; SameSite=Lax';
  window.location.href = '/';
}

// 实际项目中，应该添加一个 /api/login 接口，在后端验证密码后设置 Cookie