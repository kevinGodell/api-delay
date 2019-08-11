'use strict';

/**
 * @description ### api-delay
 * @example <caption>Example usage for adding delay using middleware and route handlers:</caption>
 * //create express app
 * const express = require('express');
 * const app = express();
 *
 * // require delayNext, delayNextIf from api-delay
 * const { delayNext, delayNextIf } = require('api-delay');
 *
 * // add a middleware delay to all routes
 * app.use(delayNext({ time: 200 }));
 *
 * // add a conditional middleware delay to all routes
 * app.use(
 *   delayNextIf({
 *     time: 300,
 *     trigger: receiver => {
 *       // will trigger delay if returns true/truthy
 *       return receiver.req.method === 'POST';
 *     }
 *   })
 * );
 *
 * // handle route post login and give slower response to non-premium user
 * app.post(
 *   '/login',
 *   // route handlers
 *   [
 *     // some middleware to authenticate user and set res.locals.premium value
 *     authMiddleware,
 *     // add 2 second delay to response if user does not have premium status
 *     delayNextIf({
 *       time: 2000,
 *       trigger: receiver => {
 *         return !receiver.res.locals.premium;
 *       }
 *     })
 *   ],
 *   (req, res) => {
 *     // send response after delay if finished
 *     res.send('response');
 *   }
 * );
 * @module api-delay
 * @author Kevin Godell <kevin.godell@gmail.com>
 * @copyright 2019 Kevin Godell
 */

/**
 * @description Object containing request and response properties.<br/> Will be passed to [Trigger](#~Trigger) function.
 * @typedef {object} Receiver
 * @property  {object} req - Request
 * @property {object} res - Response
 */

/**
 * @description Function will trigger a delayed called to next() if it returns a truthy value.
 * @typedef {Function} Trigger
 * @param {Receiver} receiver - Object containing request and response properties. see [Receiver](#~Receiver)
 * @returns {boolean} - Return a truthy value
 */

/**
 * @description Creates a middleware or route handler function that delays the call to next().
 * @param {object} [options] - Configuration options
 * @param {number} [options.time=1] - Milliseconds to wait to call next().
 * @returns {Function} A function that can be used as app middleware or route handler structured as:
 * ```
 * (req, res, next) => {
 *   // magic delay code
 *   next();
 * }
 * ```
 */
const delayNext = options => {
  return (req, res, next) => {
    const _onClose = () => clearTimeout(_setTimeout);

    const _onSetTimeout = () => {
      res.removeListener('close', _onClose);
      next();
    };

    const _setTimeout = setTimeout(_onSetTimeout, options.time);

    res.once('close', _onClose);
  };
};

/**
 * @description Creates a middleware or route handler function that delays the call to next() if trigger function returns a truthy value.
 * @param {object} options - Configuration options
 * @param {number} [options.time=1] - Milliseconds to wait to call next().
 * @param {Trigger} options.trigger - Trigger function is called with a single argument as an object containing request and response properties. If it returns a truthy value, it will trigger the delayed call to next().<br/> see [Trigger](#~Trigger)
 * @returns {Function} A function that can be used as app middleware or route handler structured as:
 * ```
 * (req, res, next) => {
 *   // magic delay code
 *   next();
 * }
 * ```
 */
const delayNextIf = options => {
  // protect against bad options, throw error

  if (!options || typeof options.trigger !== 'function') {
    throw new TypeError('options.trigger must be a function');
  }

  return (req, res, next) => {
    if (!options.trigger({ req, res })) {
      return next();
    }

    const _onClose = () => clearTimeout(_setTimeout);

    const _onSetTimeout = () => {
      res.removeListener('close', _onClose);
      next();
    };

    const _setTimeout = setTimeout(_onSetTimeout, options.time);

    res.once('close', _onClose);
  };
};

module.exports = {
  delayNext,
  delayNextIf
};
