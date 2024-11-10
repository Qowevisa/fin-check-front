
// TYPES {{{

import { BASE_API_URL } from "./api";
import type { ErrorMessage, Message } from "./api";

//
export interface Type {
  color: string;
  comment: string;
  id: number;
  name: string;
}

export interface Card {
  balance: number;
  credit_line: number;
  have_credit_line: boolean;
  id: number;
  name: string;
}

//
// }}}
//


export async function getAll<T>(groupName: string, session?: string): Promise<T[] | ErrorMessage> {
  const url = `${BASE_API_URL}/${groupName}/all`
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const headers = session
    ? { ...defaultHeaders, Cookie: `session=${session}` }
    : defaultHeaders

  const config: RequestInit = {
    headers
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const body = await response.json()
      throw new Error(`Failed to fetch ${groupName}: ${body.message}`);
    }
    return await response.json() as T[];
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}

export async function getByID<T>(groupName: string, id: number): Promise<T | ErrorMessage> {
  try {
    const response = await fetch(`${BASE_API_URL}/${groupName}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${groupName} by ID: ${response.statusText}`);
    }
    return await response.json() as T;
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}

export async function create<T>(groupName: string, data: T, session?: string): Promise<Message | ErrorMessage> {
  const url = `${BASE_API_URL}/${groupName}/add`
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const headers = session
    ? { ...defaultHeaders, Cookie: `session=${session}` }
    : defaultHeaders

  const config: RequestInit = {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  };

  console.log(data)

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const body = await response.json()
      throw new Error(`Failed to create ${groupName}: ${body.message}`);
    }
    return await response.json() as Message;
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}

export async function update<T>(groupName: string, id: number, data: T, session?: string): Promise<T | ErrorMessage> {
  const url = `${BASE_API_URL}/${groupName}/edit/${id}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const headers = session
    ? { ...defaultHeaders, Cookie: `session=${session}` }
    : defaultHeaders

  const config: RequestInit = {
    method: 'PUT',
    headers,
    body: JSON.stringify(data)
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const body = await response.json()
      throw new Error(`Failed to update ${groupName}: ${body.message}`);
    }
    return await response.json() as T;
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}

export async function remove(groupName: string, id: number, session?: string): Promise<Message | ErrorMessage> {
  const url = `${BASE_API_URL}/${groupName}/delete/${id}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const headers = session
    ? { ...defaultHeaders, Cookie: `session=${session}` }
    : defaultHeaders

  const config: RequestInit = {
    method: 'DELETE',
    headers,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`Failed to delete ${groupName}: ${response.statusText}`);
    }
    return await response.json() as Message;
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}
