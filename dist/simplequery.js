'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var Tokens = {
  IDENTIFIER: 'IDENTIFIER',
  ARRAY_END: 'ARRAY_END',
  ARRAY_START: 'ARRAY_START',
  PROP_ACCESS: 'PROP_ACCESS'
};

var addToken = function addToken(tokens, type) {
  var payload = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  return tokens.concat([_extends({
    type: type
  }, payload)]);
};

var hyped = function hyped(tail, tokens, column) {
  return function (tokenType) {
    return [tail, addToken(tokens, tokenType), column + 1];
  };
};

var propRegex = /[a-zA-Z0-9_]/;

var parseQuery = function parseQuery(_x5) {
  var _arguments = arguments;
  var _again = true;

  _function: while (_again) {
    var query = _x5;
    tokens = column = _query = first = tail = myhype = _index = index = tokenValue = newTail = undefined;
    var tokens = _arguments.length <= 1 || _arguments[1] === undefined ? [] : _arguments[1];
    _again = false;
    var column = _arguments.length <= 2 || _arguments[2] === undefined ? 1 : _arguments[2];

    if (query.length === 0) {
      return tokens;
    }

    var _query = _toArray(query);

    var first = _query[0];

    var tail = _query.slice(1);

    var myhype = hyped(tail, tokens, column);

    if (first === ']') {
      _arguments = _toConsumableArray(myhype(Tokens.ARRAY_END));
      _x5 = _arguments[0];
      _again = true;
      continue _function;
    }
    if (first === '[') {
      _arguments = _toConsumableArray(myhype(Tokens.ARRAY_START));
      _x5 = _arguments[0];
      _again = true;
      continue _function;
    }
    if (first === '.') {
      _arguments = _toConsumableArray(myhype(Tokens.PROP_ACCESS));
      _x5 = _arguments[0];
      _again = true;
      continue _function;
    }

    if (first.match(propRegex)) {
      var _index = tail.findIndex(function (x) {
        return x.match(propRegex) === null;
      });
      var index = _index === -1 ? tail.length : _index;

      var tokenValue = tail.slice(0, index);
      var newTail = tail.slice(index);

      _arguments = [_x5 = newTail, addToken(tokens, Tokens.IDENTIFIER, {
        value: first + tokenValue.join('')
      }), column + index];
      _again = true;
      continue _function;
    }

    throw new Error('Unexpected "' + first + '" in query at character ' + column);
  }
};

var executeQuery = function executeQuery(_x6, _x7) {
  var _again2 = true;

  _function2: while (_again2) {
    var _ref = _x6,
        env = _x7;
    cursor = tokens = store = getFn = _tokens = token = tail = _executeQuery = derivedKey = newTail = undefined;
    var cursor = _ref.cursor;
    var tokens = _ref.tokens;
    _again2 = false;
    var store = env.store;
    var getFn = env.getFn;

    if (tokens.length === 0) {
      return { cursor: cursor, tokens: tokens };
    }

    var _tokens = _toArray(tokens);

    var token = _tokens[0];

    var tail = _tokens.slice(1);

    switch (token.type) {
      case Tokens.PROP_ACCESS:
        // Do nothing, hahaha :')
        _x6 = { cursor: cursor, tokens: tail };
        _x7 = env;
        _again2 = true;
        continue _function2;

      case Tokens.IDENTIFIER:
        _x6 = {
          cursor: getFn(cursor, token.value),
          tokens: tail
        };
        _x7 = env;
        _again2 = true;
        continue _function2;

      case Tokens.ARRAY_START:
        var _executeQuery = executeQuery({
          cursor: store,
          tokens: tail
        }, env),
            derivedKey = _executeQuery.cursor,
            newTail = _executeQuery.tokens;

        _x6 = {
          cursor: getFn(cursor, derivedKey),
          tokens: newTail
        };
        _x7 = store;
        _again2 = true;
        continue _function2;

      case Tokens.ARRAY_END:
        return { cursor: cursor, tokens: tail };
    }
  }
};

var defGetFn = function defGetFn(dict, key) {
  return dict[key];
};

var simpleQuery = function simpleQuery(query) {
  var tokens = parseQuery(query);

  return function (store) {
    var getFn = arguments.length <= 1 || arguments[1] === undefined ? defGetFn : arguments[1];

    var _executeQuery2 = executeQuery({
      cursor: store,
      tokens: tokens
    }, { store: store, getFn: getFn });

    var cursor = _executeQuery2.cursor;
    var newTokens = _executeQuery2.tokens;

    if (newTokens.length !== 0) {
      console.log(newTokens);
      throw new Error('Tokens not consumed');
    }

    return cursor;
  };
};

exports['default'] = simpleQuery;
module.exports = exports['default'];