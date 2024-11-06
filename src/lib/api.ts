// src/lib/api.ts

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

// Generic function for making API requests
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

    if (!response.ok) {
      const errorData = await response.json(); // Parse error response as JSON
      const errorMessage = errorData.message || `Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API fetch error: ${error}`);
    throw error;
  }
}

// Login function with type annotation for the response
export async function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/user/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// Get user data function with type annotation for the response
export async function getUserData(token: string): Promise<UserData> {
  return apiFetch<UserData>('/user/me', {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { BASE_API_URL };

