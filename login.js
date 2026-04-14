async function login() {
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');
  
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  
  const data = await res.json();
  if (data.success) {
    window.location.href = '/';
  } else {
    errorEl.textContent = data.error;
    errorEl.classList.remove('hidden');
  }
}