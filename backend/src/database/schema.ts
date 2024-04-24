import {
    mysqlTable,
    serial,
    uniqueIndex,
    varchar,
    date
  } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }),
    email: varchar('email', { length: 256 }),
    hashedPassword: varchar('password', { length: 256}),
    affiliation: varchar('affiliation', { length: 256 }),
    dob: date('dob')
    }, (users) => ({
    emailIndex: uniqueIndex('email_idx').on(users.email),
}));