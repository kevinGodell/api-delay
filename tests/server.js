'use strict';

const forked = !!process.send;

if (forked) process.once('disconnect', () => process.exit());

const express = require('express');
const app = express();

const { delayNext, delayNextIf } = require('../');

// disable response header for privacy
app.disable('x-powered-by');

// configure json response formatting
app.set('json spaces', 2);
app.set('json replacer', null);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(delayNext({ time: 1 }));

app.all(
  '/',
  [
    delayNextIf({
      time: 4,
      trigger: receiver => {
        return receiver.req.method === 'GET';
      }
    })
  ],
  (req, res) => {
    res.json({ message: 'success' });
  }
);

app.all(
  '/a',
  [
    delayNextIf({
      time: 4,
      trigger: receiver => {
        return receiver.req.method === 'GET';
      }
    })
  ],
  (req, res) => {
    res.json({ message: 'success' });
  }
);

app.all(
  '/b',
  [
    delayNextIf({
      time: 8,
      trigger: receiver => {
        return receiver.req.method === 'GET';
      }
    })
  ],
  (req, res) => {
    res.json({ message: 'success' });
  }
);

app.all(
  '/c',
  [
    delayNext({
      time: 3
    })
  ],
  (req, res) => {
    res.json({ message: 'success' });
  }
);

const routeHandler = (req, res, next) => {
  if (req.body.username === 'good_user') {
    res.locals.authenticated = true;
  }
  next();
};

app.all(
  '/d',
  [
    routeHandler,
    delayNextIf({
      time: 1,
      trigger: receiver => {
        return !receiver.res.locals.authenticated;
      }
    })
  ],
  (req, res) => {
    res.json({ message: 'success' });
  }
);

const port = 4000;

const server = app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
  if (forked) process.send({ status: 'running', port });
});

server.setTimeout(500000);
