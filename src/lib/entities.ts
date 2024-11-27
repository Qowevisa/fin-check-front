
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
  last_digits: string;
  currency_id: number;
  currency: Currency;
  display_name: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number;
}

export interface Expense {
  id: number;
  card_id: number;
  type_id: number;
  value: number;
  comment: string;
  date: string;
  card: Card;
  show_value: string;
}

export interface ExpenseBulk {
  propagate_card_id: boolean;
  card_id: number;
  propagate_type_id: boolean;
  type_id: number;
  propagate_value: boolean;
  value: number;
  propagate_comment: boolean;
  comment: string;
  propagate_date: boolean;
  date: string;
  children: Partial<Expense>[];
}

export interface Income {
  id: number;
  card_id: number;
  value: number;
  comment: string;
  date: string;
}

export interface Transfer {
  id: number;
  from_card_id: number;
  to_card_id: number;
  value: number;
  from_value: number;
  to_value: number;
  date: string;
  show_value: string;
  have_diff_currs: boolean;
  from_card: Card;
  to_card: Card;
}

export interface Payment {
  id: number;
  card_id: number | null;
  category_id: number | null;
  user_id: number | null;
  title: string;
  descr: string;
  note: string;
  date: string; // ISO 8601 format
  items: ItemBought[];
}

export interface ItemBought {
  id: number;
  new_name: string;
  new_comment: string;
  item_id: number;
  payment_id: number;
  type_id: number;
  price: number;
  quantity: number;
  total_cost: number;
  metric_type: number;
  metric_value: number;
}

export interface Item {
  id: number;
  category_id: number;
  current_price_id: number;
  type_id: number;
  name: string;
  comment: string;
  metric_type: number;
  metric_value: number;
  proteins: number;
  carbs: number;
  fats: number;
  price: number;
}

export interface ItemFilter {
  category_id: number;
  type_id: number;
}

export interface Metric {
  value: number;
  name: string;
  short: string;
}

export interface Currency {
  id: number;
  name: string;
  iso_name: string;
  symbol: string;
}

export const EntityTypes = {
  card: "Card",
  type: "Type",
  category: "Category",
  expense: "Expense",
  income: "Income",
  transfer: "Transfer",
  payment: "Payment",
  metric: "Metric",
  currency: "Currency",
  expense_bulk: "ExpenseBulk",
} as const;

export type EntityName = keyof typeof EntityTypes;
export type EntityType<T extends EntityName> =
  T extends "card" ? Card :
  T extends "type" ? Type :
  T extends "category" ? Category :
  T extends "expense" ? Expense :
  T extends "income" ? Income :
  T extends "transfer" ? Transfer :
  T extends "payment" ? Payment :
  T extends "metric" ? Metric :
  T extends "currency" ? Currency :
  T extends "expense_bulk" ? ExpenseBulk :
  never;

//
// }}}
//


export async function getAll<T>(groupName: string, session?: string, queryParams?: string): Promise<T[] | ErrorMessage> {
  const url = queryParams ? `${BASE_API_URL}/${groupName}/all?${queryParams}` : `${BASE_API_URL}/${groupName}/all`
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

export async function bulk_create<T>(groupName: string, data: T, session?: string): Promise<Message | ErrorMessage> {
  const url = `${BASE_API_URL}/${groupName}/bulk_create`
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
      const body = await response.json()
      throw new Error(`Failed to delete ${groupName}: ${body.message}`);
    }
    return await response.json() as Message;
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}

export async function filter<F, R>(groupName: string, data: F, session?: string): Promise<R | ErrorMessage> {
  const url = `${BASE_API_URL}/${groupName}/filter`
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

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const body = await response.json()
      throw new Error(`Failed to update ${groupName}: ${body.message}`);
    }
    return await response.json() as R;
  } catch (err) {
    const error = err as Error
    return { message: error.message };
  }
}
