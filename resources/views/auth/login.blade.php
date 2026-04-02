<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitalLoka - {{ $mode === 'admin' ? 'Admin Login' : 'Dashboard Login' }}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --background: #FFFDF5;
      --foreground: #1E293B;
      --muted: #F1F5F9;
      --muted-foreground: #64748B;
      --accent: {{ $mode === 'admin' ? '#F43F5E' : '#0EA5E9' }};
      --accent-soft: {{ $mode === 'admin' ? '#FFE4E6' : '#E0F2FE' }};
      --border: #E2E8F0;
      --card: #FFFFFF;
      --shadow: #1E293B;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
      --radius-sm: 8px;
      --radius-md: 16px;
      --radius-xl: 28px;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: var(--font-body);
      color: var(--foreground);
      background:
        radial-gradient(circle at 20% 20%, var(--accent-soft) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, #FEF3C7 0%, transparent 40%),
        var(--background);
    }

    .card {
      width: min(540px, 100%);
      background: var(--card);
      border: 2px solid var(--foreground);
      border-radius: var(--radius-xl);
      box-shadow: 10px 10px 0 var(--shadow);
      padding: 28px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--accent-soft);
      color: var(--accent);
      border: 2px solid var(--accent);
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 16px;
    }

    h1 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: clamp(1.6rem, 3.5vw, 2.2rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
    }

    p {
      margin: 12px 0 0;
      color: var(--muted-foreground);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    form {
      margin-top: 24px;
      display: grid;
      gap: 12px;
    }

    label {
      font-size: 0.86rem;
      font-weight: 700;
    }

    input[type="email"] {
      width: 100%;
      border: 2px solid var(--border);
      background: #fff;
      border-radius: var(--radius-md);
      padding: 12px 14px;
      font-size: 0.95rem;
      font-family: var(--font-body);
      color: var(--foreground);
      outline: none;
    }

    input[type="email"]:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .btn {
      margin-top: 4px;
      border: 2px solid var(--foreground);
      background: var(--accent);
      color: #fff;
      border-radius: 999px;
      padding: 12px 16px;
      font-size: 0.94rem;
      font-weight: 700;
      font-family: var(--font-body);
      cursor: pointer;
      box-shadow: 4px 4px 0 var(--shadow);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: 6px 6px 0 var(--shadow);
    }

    .btn:disabled {
      opacity: 0.75;
      cursor: wait;
    }

    .message {
      margin-top: 12px;
      border-radius: var(--radius-md);
      padding: 10px 12px;
      font-size: 0.87rem;
      display: none;
      border: 2px solid transparent;
    }

    .message.show { display: block; }
    .message.success { background: #DCFCE7; border-color: #16A34A; color: #166534; }
    .message.error { background: #FEE2E2; border-color: #DC2626; color: #991B1B; }

    .links {
      margin-top: 18px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .links a {
      font-size: 0.83rem;
      color: var(--foreground);
      text-decoration: none;
      border-bottom: 2px dashed var(--border);
      font-weight: 700;
    }

    .links a:hover { border-color: var(--accent); }
  </style>
</head>
<body>
  <main class="card">
    <span class="badge">{{ $mode === 'admin' ? 'Admin Access' : 'User Dashboard' }}</span>
    <h1>{{ $title }}</h1>
    <p>{{ $description }}</p>

    <form id="login-form">
      <input type="hidden" id="next" value="{{ $next }}" />
      <label for="email">Email Address</label>
      <input id="email" type="email" placeholder="you@digitalloka.com" required />
      <button id="submit" class="btn" type="submit">Send Magic Link</button>
      <div id="message" class="message"></div>
    </form>

    <div class="links">
      <a href="/">Back to Catalog</a>
      @if ($mode === 'admin')
        <a href="/login?next=/dashboard">User Login</a>
      @else
        <a href="/admin/login?next=/admin">Admin Login</a>
      @endif
    </div>
  </main>

  <script>
    const form = document.getElementById('login-form');
    const submitBtn = document.getElementById('submit');
    const message = document.getElementById('message');

    function showMessage(text, kind) {
      message.textContent = text;
      message.className = 'message show ' + kind;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      message.className = 'message';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: document.getElementById('email').value,
            next: document.getElementById('next').value
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to send magic link.');
        }

        showMessage('Magic link sent. Check your email and continue with the sign-in link.', 'success');
      } catch (error) {
        showMessage(error.message || 'Unable to send magic link.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Magic Link';
      }
    });

    const error = new URLSearchParams(window.location.search).get('error');
    if (error === 'forbidden') {
      showMessage('Your account is authenticated but not allowed to access the admin dashboard.', 'error');
    }
  </script>
</body>
</html>
