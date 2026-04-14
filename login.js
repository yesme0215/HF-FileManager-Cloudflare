async function login() {
  const pwd = document.getElementById('password').value;
  const err = document.getElementById('error');

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pwd })
  });

  const data = await res.json();
  if (data.success) {
    location.href = '/';
  } else {
    err.textContent = data.error;
  }
}