const path = require('path');
const { createDb } = require('./db');
const { seed } = require('./seed');
const { createApp } = require('./app');

const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, 'taskflow.db');

const db = createDb(DB_PATH);
seed(db);

const app = createApp(db);

app.listen(PORT, () => {
  console.log(`TaskFlow backend running on http://localhost:${PORT}`);
});