require('dotenv').config();
const { Client } = require('pg');

// Connect to the default 'postgres' database to create our app database
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Barrister1234@pg',
  database: 'postgres',
});

async function createDatabase() {
  try {
    await client.connect();
    await client.query('CREATE DATABASE "report-hub"');
    console.log('✅ Database "report-hub" created successfully!');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('ℹ️  Database "report-hub" already exists.');
    } else {
      console.error('❌ Error creating database:', err.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
