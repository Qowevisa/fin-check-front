// src/lib/api.ts

import type { Cookies } from "@sveltejs/kit";

// Cookie Helpers {{{
//
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

// Helper function to parse set-cookie header
function parseSetCookieHeader(setCookieHeader: string) {
  const [cookie, ...attributes] = setCookieHeader.split(';').map(part => part.trim());
  const [name, value] = cookie.split('=');

  const options: CookieOptions = {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  };

  attributes.forEach(attr => {
    const [key, val] = attr.split('=');

    switch (key.toLowerCase()) {
      case 'httponly':
        options.httpOnly = true;
        break;
      case 'secure':
        options.secure = true;
        break;
      case 'samesite':
        options.sameSite = val?.toLowerCase() as 'strict' | 'lax' | 'none';
        break;
      case 'max-age':
        options.maxAge = parseInt(val, 10);
        break;
      case 'path':
        options.path = val || '/';
        break;
      case 'domain':
        options.domain = val;
        break;
    }
  });

  return { name, value, options };
}
// }}}
//

// Define the base URL of your API
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL_SERVER || 'http://localhost:3111/api';

// Interface for the login response
interface LoginResponse {
  id: string;
  name: string;
  token: string;
}

// Interface for user data response
interface UserData {
  id: string;
  email: string;
  name: string;
}

interface ErrorMessage {
  message: string;
}

// Generic function for making API requests
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  cookies?: Cookies,
): Promise<T> {
  const url = `${BASE_API_URL}${endpoint}`;
  console.log("Fetching ", url)

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  };

  try {
    const response = await fetch(url, config);

    console.log(response.headers);
    if (response.headers) {
      const setCookieHeader = response.headers.get("Set-Cookie");
      if (setCookieHeader) {
        const parsedCookie = parseSetCookieHeader(setCookieHeader);
        if (parsedCookie) {
          cookies?.set(parsedCookie.name, parsedCookie.value, parsedCookie.options)
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json(); // Parse error response as JSON
      const errorMessage = errorData.message || `Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API fetch error: ${error}`);
    throw error as ErrorMessage;
  }
}

// Login function with type annotation for the response
export async function login(username: string, password: string, cookies?: Cookies): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/user/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }, cookies);
}

// Get user data function with type annotation for the response
export async function getUserData(token: string): Promise<UserData> {
  return apiFetch<UserData>('/user/me', {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { BASE_API_URL };

