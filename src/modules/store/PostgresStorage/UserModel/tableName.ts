import { escapeIdentifier } from 'pg';

export const tableName = escapeIdentifier('users');
