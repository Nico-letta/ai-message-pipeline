const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

// On utilise l'URL native de JavaScript pour découper la chaîne unique DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '3306', 10),
  user: dbUrl.username,
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace('/', ''), // Retire le slash initial pour avoir le nom de la BDD
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

console.log('  Prisma Client connecté (Source unique : DATABASE_URL).');

module.exports = prisma;