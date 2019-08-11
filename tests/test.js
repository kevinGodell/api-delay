'use strict';

const { join } = require('path');

const { fork } = require('child_process');

const assert = require('assert');

const request = require('request-promise-native');

const path = join(__dirname, './server.js');

const params = [];

const options = {
  detached: false,
  stdio: ['ignore', 'inherit', 'inherit', 'ipc']
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
  assert(duration >= minimum, `❌ duration: ${duration} < minimum: ${minimum}`);
  console.log(`✅ duration: ${duration} >= minimum: ${minimum}`);
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
    let result = await request(`http://localhost:${port}/`, options);
    checkDuration(start, Date.now(), 500);
    checkResult(result);

    start = Date.now();
    result = await request(`http://localhost:${port}/a`, options);
    checkDuration(start, Date.now(), 4100);
    checkResult(result);

    start = Date.now();
    result = await request(`http://localhost:${port}/b`, options);
    checkDuration(start, Date.now(), 8100);
    checkResult(result);

    start = Date.now();
    result = await request(`http://localhost:${port}/c`, options);
    checkDuration(start, Date.now(), 3100);
    checkResult(result);

    // testing POST

    options.method = 'POST';

    start = Date.now();
    result = await request(`http://localhost:${port}/`, options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    start = Date.now();
    result = await request(`http://localhost:${port}/a`, options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    start = Date.now();
    result = await request(`http://localhost:${port}/b`, options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    start = Date.now();
    result = await request(`http://localhost:${port}/c`, options);
    checkDuration(start, Date.now(), 3100);
    checkResult(result);

    // testing good_user

    options.body = { username: 'good_user' };

    start = Date.now();
    result = await request(`http://localhost:${port}/d`, options);
    checkDuration(start, Date.now(), 100);
    checkResult(result);

    // testing bad_user

    options.body = { username: 'bad_user' };

    start = Date.now();
    result = await request(`http://localhost:${port}/d`, options);
    checkDuration(start, Date.now(), 10100);
    checkResult(result);

    console.log('🎉 success');
    process.exit(0);
  } catch (e) {
    console.error(`${e.message}`);
    process.exit(1);
  }
});
