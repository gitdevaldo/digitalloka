<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitalLoka - Sign In Callback</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: #FFFDF5;
      color: #1E293B;
    }
    .status {
      border: 2px solid #1E293B;
      box-shadow: 6px 6px 0 #1E293B;
      border-radius: 16px;
      padding: 18px 20px;
      background: #fff;
      max-width: 520px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="status" id="status">Completing sign in...</div>

  <script>
    const statusEl = document.getElementById('status');

    function setStatus(message) {
      statusEl.textContent = message;
    }

    async function persistSession(accessToken, refreshToken, expiresIn) {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: expiresIn
        })
      });

      if (!response.ok) {
        throw new Error('Unable to persist session cookie');
      }
    }

    (async function handleCallback() {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = Number(hashParams.get('expires_in') || '3600');
      const next = searchParams.get('next');
      const fallback = @json($next);
      const redirectTarget = (next && next.startsWith('/')) ? next : fallback;

      if (!accessToken) {
        setStatus('Sign-in callback is missing token information. Please request a new magic link.');
        return;
      }

      try {
        await persistSession(accessToken, refreshToken, Number.isFinite(expiresIn) ? expiresIn : 3600);
      } catch (error) {
        setStatus('Sign in failed while saving session. Please request a new magic link.');
        return;
      }

      setStatus('Sign in complete. Redirecting...');
      window.location.replace(redirectTarget);
    })();
  </script>
</body>
</html>
