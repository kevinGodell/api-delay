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

const assert = require('assert');

assert.throws(() => {
  delayNextIf();
}, /TypeError: options.trigger must be a function/);

assert.throws(() => {
  delayNextIf({ time: 1 });
}, /TypeError: options.trigger must be a function/);

assert.throws(() => {
  delayNextIf({ time: 1, trigger: 123 });
}, /TypeError: options.trigger must be a function/);

app.use(delayNext({ time: 100 }));

app.all(
  '/',
  [
    delayNextIf({
      time: 400,
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
      time: 4000,
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
      time: 8000,
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
      time: 3000
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
      time: 10000,
      trigger: receiver => {
        return !receiver.res.locals.authenticated;
      }
    })
  ],
  (req, res) => {
    res.json({ message: 'success' });
  }
);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
  if (forked) process.send({ status: 'running', port });
});
