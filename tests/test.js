'use strict';

const express = require('express');
const app = express();

const request = require('request-promise-native');

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

const checkResult = result => {
  const { message } = result;
  if (message !== 'success') {
    throw new Error(`bad message = ${message}`);
  }
};

const checkDuration = (start, finish, minimum) => {
  const duration = finish - start;
  if (duration < minimum) {
    throw new Error(`❌ duration: ${duration}, minimum: ${minimum}`);
  }
  console.log(`✅ duration: ${duration}, minimum: ${minimum}`);
};

const server = app.listen(port, async () => {
  console.log(`Server started on http://localhost:${port}`);

  try {
    const options = { json: true, method: 'GET', headers: { Connection: 'keep-alive' } };

    // testing GET

    console.log('get');

    let start = Date.now();
    let result = await request('http://localhost:4000/', options);
    checkDuration(start, Date.now(), 5);
    checkResult(result);

    console.log('get2');

    start = Date.now();
    result = await request('http://localhost:4000/a', options);
    checkDuration(start, Date.now(), 4);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/b', options);
    checkDuration(start, Date.now(), 8);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/c', options);
    checkDuration(start, Date.now(), 3);
    checkResult(result);

    // testing POST

    options.method = 'POST';

    start = Date.now();
    result = await request('http://localhost:4000/', options);
    checkDuration(start, Date.now(), 1);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/a', options);
    checkDuration(start, Date.now(), 1);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/b', options);
    checkDuration(start, Date.now(), 1);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/c', options);
    checkDuration(start, Date.now(), 3);
    checkResult(result);

    // testing good_user

    options.body = { username: 'good_user' };

    start = Date.now();
    result = await request('http://localhost:4000/d', options);
    checkDuration(start, Date.now(), 1);
    checkResult(result);

    // testing bad_user

    options.body = { username: 'bad_user' };

    start = Date.now();
    result = await request('http://localhost:4000/d', options);
    checkDuration(start, Date.now(), 1);
    checkResult(result);

    console.log('🎉 success');
    process.exit(0);
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }
});
