import type postgres from 'postgres';

export type SqlClient = postgres.Sql;

export function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

export function toNullableIsoString(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return toIsoString(value);
}

export function parseJsonColumn<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (typeof value === 'object') {
    return value as T;
  }
  return fallback;
}
