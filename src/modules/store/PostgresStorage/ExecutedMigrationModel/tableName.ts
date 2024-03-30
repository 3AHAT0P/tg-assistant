import { escapeIdentifier } from 'pg';

export const tableName = escapeIdentifier('__migrations__');
