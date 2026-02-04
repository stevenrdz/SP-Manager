export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('admin_api_key') : null;
  
  // Define which routes absolutely require the key BEFORE fetching
  const isPost = options.method && options.method !== 'GET';
  const isProtectedPath = ['/api/scan', '/api/config', '/api/backup/import'].some(p => url.startsWith(p));
  
  if ((isPost || isProtectedPath) && !apiKey && !url.includes('/api/auth/validate')) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth_error'));
    }
    throw new Error('Authentication required before request');
  }

  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch(url, { ...options, headers: headers as any });

  if (response.status === 401) {
    // Trigger auth modal if the request failed with 401 (e.g. key was invalid)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth_error'));
    }
  }

  return response;
}

export async function validateAdminApiKey(key: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/validate', {
      headers: {
        'x-api-key': key
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

