# api-delay
###### [![Build Status](https://travis-ci.org/kevinGodell/api-delay.svg?branch=master)](https://travis-ci.org/kevinGodell/api-delay) [![Build status](https://ci.appveyor.com/api/projects/status/1ca52luqybn9xm2t/branch/master?svg=true)](https://ci.appveyor.com/project/kevinGodell/api-delay/branch/master)
#### What?
- Deliberately cause a delayed http response in an express app.
#### Why?
- Simulate a slow api response to test front end handling.
- Throttle api access to abusers, non-premium users, etc.
#### How?
- Creates a function that can be used as app middleware or a route handler.
- Set the time and trigger options to customize the delayed call to next().
#### When?
- [delayNext](https://kevingodell.github.io/api-delay/module-api-delay.html#~delayNext) will always **delay** the call to **next**().
- [delayNextIf](https://kevingodell.github.io/api-delay/module-api-delay.html#~delayNextIf) will only **delay** the call to **next**() **if** [Trigger](https://kevingodell.github.io/api-delay/module-api-delay.html#~Trigger) returns a truthy value.
#### Installation
```
npm install api-delay
```
#### Usage
see [docs](https://kevingodell.github.io/api-delay/module-api-delay.html)
