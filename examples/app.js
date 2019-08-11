'use strict';

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
    res.json({ message: 'hello' });
  }
);

const port = 4000;

app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
