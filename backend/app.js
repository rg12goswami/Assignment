const express = require('express');
const cors = require('cors');
const boardsRouter = require('./routes/boards');
const tasksRouter = require('./routes/tasks');

function createApp(db) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/boards', boardsRouter(db));
  app.use('/api/tasks', tasksRouter(db));

  // Unknown route
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Central error handler — keeps a bad request from ever returning a raw
  // stack trace or blank screen to the frontend.
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  });

  return app;
}

module.exports = { createApp };