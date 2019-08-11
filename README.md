# api-delay
#### What?
- Deliberately cause a delayed http response in an express app.
#### Why?
- Simulate a slow api response to test front end handling.
- Throttle api access to abusers, non-premium users, etc.
#### How?
- Creates a function that can be used as app middleware or a route handler.
- Set the time and trigger options to customize the delayed call to next().
#### When?
- [delayNext](#~delayNext) will always **delay** the call to **next**().
- [delayNextIf](#~delayNextIf) will only **delay** the call to **next**() **if** [Trigger](#~Trigger) returns a truthy value.
#### Installation
```
npm install api-delay
```
#### Usage
see [docs](https://kevingodell.github.io/pam-diff/PamDiff.html)
