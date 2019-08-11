'use strict';

const { join } = require('path');

const { fork } = require('child_process');

const request = require('request-promise-native');

const path = join(__dirname, './server.js');

console.log(path);

const params = [];

const options = {
  detached: false,
  stdio: ['ignore', 'inherit', 'ignore', 'ipc']
};

const child = fork(path, params, options);

const checkResult = result => {
  const { message } = result;
  if (message !== 'success') {
    throw new Error(`bad message = ${message}`);
  }
};

const checkDuration = (start, finish, minimum) => {
  const duration = finish - start;
  if (duration < minimum) {
    throw new Error(`bad duration = ${duration}`);
  }
  console.log(`duration: ${duration}, minimum: ${minimum}`);
};

child.once('message', async message => {
  const { status = 'fail', port } = message;

  if (status !== 'running') {
    console.error({ status });
    process.exit(1);
  }

  try {
    const options = { json: true, method: 'GET' };

    // testing GET

    let start = Date.now();
    let result = await request('http://localhost:4000/', options);
    checkDuration(start, Date.now(), 500);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/a', options);
    checkDuration(start, Date.now(), 4100);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/b', options);
    checkDuration(start, Date.now(), 8100);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/c', options);
    checkDuration(start, Date.now(), 3100);
    checkResult(result);

    // testing POST

    options.method = 'POST';

    start = Date.now();
    result = await request('http://localhost:4000/', options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/a', options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/b', options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    start = Date.now();
    result = await request('http://localhost:4000/c', options);
    checkDuration(start, Date.now(), 3100);
    checkResult(result);

    // testing good_user

    options.body = { username: 'good_user' };

    start = Date.now();
    result = await request('http://localhost:4000/d', options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    // testing bad_user

    options.body = { username: 'bad_user' };

    start = Date.now();
    result = await request('http://localhost:4000/d', options);
    checkDuration(start, Date.now(), 10100);
    checkResult(result);

    console.log('success');
    process.exit(0);
  } catch (e) {
    console.error(`request error: ${e.message}`);
    process.exit(1);
  }
});
