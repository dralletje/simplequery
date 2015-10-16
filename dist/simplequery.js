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
  PROP_ACCESS: 'PROP_ACCESS',
  EOF: 'EOF'
};

var addToken = function addToken(tokens, type) {
  var payload = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  return tokens.concat([_extends({
    type: type
  }, payload)]);
};

var hyped = function hyped(tail, tokens, column) {
  return function (tokenType) {
    return [tail, addToken(tokens, tokenType, {
      column: column
    }), column + 1];
  };
};

var propRegex = /[a-zA-Z0-9_$]/;
var getIdentifierToken = function getIdentifierToken(_ref) {
  var query = _ref.query;
  var tokens = _ref.tokens;
  var tokenType = _ref.tokenType;
  var column = _ref.column;

  var _index = query.findIndex(function (x) {
    return x.match(propRegex) === null;
  });
  var index = _index === -1 ? query.length : _index;

  var tokenValue = query.slice(0, index);
  var newTail = query.slice(index);

  return [newTail, addToken(tokens, tokenType, {
    value: tokenValue.join(''),
    column: column + index
  }), column + index];
};

var parseQuery = function parseQuery(_x4) {
  var _arguments = arguments;
  var _again = true;

  _function: while (_again) {
    var query = _x4;
    tokens = column = _query = first = tail = myhype = undefined;
    var tokens = _arguments.length <= 1 || _arguments[1] === undefined ? [] : _arguments[1];
    _again = false;
    var column = _arguments.length <= 2 || _arguments[2] === undefined ? 1 : _arguments[2];

    if (query.length === 0) {
      return tokens.concat([{ type: Tokens.EOF }]);
    }

    var _query = _toArray(query);

    var first = _query[0];

    var tail = _query.slice(1);

    var myhype = hyped(tail, tokens, column);

    if (first === ']') {
      _arguments = _toConsumableArray(myhype(Tokens.ARRAY_END));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }
    if (first === '[') {
      _arguments = _toConsumableArray(myhype(Tokens.ARRAY_START));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }
    if (first === '.') {
      _arguments = _toConsumableArray(myhype(Tokens.PROP_ACCESS));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }

    if (first.match(propRegex)) {
      _arguments = _toConsumableArray(getIdentifierToken({
        tokens: tokens, column: column, query: query,
        tokenType: Tokens.IDENTIFIER
      }));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }

    throw new Error('Unexpected "' + first + '" in query at character ' + column);
  }
};

var rootSymbol = Symbol('Root of query cursor');

// TODO: Find these 'syntax errors' on lexer time
var tokenError = function tokenError(token, message) {
  throw new Error('Syntax error: Unexpected token ' + token.type + ', ' + message + ', at character ' + token.column);
};
var expectToken = function expectToken(tokenType, token) {
  if (token.type !== tokenType) {
    tokenError('expected ' + tokenType);
  }
};

var executeQuery = function executeQuery(_x5, _x6) {
  var _again2 = true;

  _function2: while (_again2) {
    var _ref2 = _x5,
        env = _x6;
    _ref2$cursor = cursor = tokens = getFromRoot = getProp = _tokens = token = tail = isRoot = _tail = identifier = nextTail = _executeQuery = derivedKey = newTail = undefined;
    var _ref2$cursor = _ref2.cursor;
    var cursor = _ref2$cursor === undefined ? rootSymbol : _ref2$cursor;
    var tokens = _ref2.tokens;
    _again2 = false;

    if (tokens.length === 0) {
      throw new Error('This should never happen');
    }

    var getFromRoot = env.getFromRoot;
    var getProp = env.getProp;

    var _tokens = _toArray(tokens);

    var token = _tokens[0];

    var tail = _tokens.slice(1);

    // Only two tokens are allowed at root now
    var isRoot = cursor === rootSymbol;
    if (isRoot && token.type !== Tokens.IDENTIFIER && token.type !== Tokens.ARRAY_START) {
      tokenError(token, 'expected ' + Tokens.IDENTIFIER + ' or ' + Tokens.ARRAY_START);
    }

    switch (token.type) {

      case Tokens.PROP_ACCESS:
        var _tail = _toArray(tail),
            identifier = _tail[0],
            nextTail = _tail.slice(1);

        expectToken(Tokens.IDENTIFIER, identifier);
        _x5 = {
          cursor: getProp(cursor, identifier.value),
          tokens: nextTail
        };
        _x6 = env;
        _again2 = true;
        continue _function2;

      case Tokens.IDENTIFIER:
        _x5 = {
          cursor: getFromRoot(token.value),
          tokens: tail
        };
        _x6 = env;
        _again2 = true;
        continue _function2;

      case Tokens.ARRAY_START:
        var _executeQuery = executeQuery({
          tokens: tail
        }, env),
            derivedKey = _executeQuery.cursor,
            newTail = _executeQuery.tokens;

        _x5 = {
          cursor:
          // Array start can also be on the 'root' or the query
          // eg. '[somevar].stuff' is valid
          isRoot ? getFromRoot(derivedKey) : getProp(cursor, derivedKey),
          tokens: newTail
        };
        _x6 = env;
        _again2 = true;
        continue _function2;

      case Tokens.ARRAY_END:
        return { cursor: cursor, tokens: tail };

      case Tokens.EOF:
        return { cursor: cursor, tokens: tail };

      default:
        throw new Error('Unexpected token ' + token.type);
    }
  }
};

var defGetFn = function defGetFn(dict, key) {
  return dict[key];
};

var simpleQuery = function simpleQuery(query) {
  var tokens = parseQuery(Array.from(query));

  var fn = function fn(_ref3) {
    var getFromRoot = _ref3.getFromRoot;
    var _ref3$getProp = _ref3.getProp;
    var getProp = _ref3$getProp === undefined ? defGetFn : _ref3$getProp;

    var _executeQuery2 = executeQuery({ tokens: tokens }, { getProp: getProp, getFromRoot: getFromRoot });

    var cursor = _executeQuery2.cursor;
    var newTokens = _executeQuery2.tokens;

    if (newTokens.length !== 0) {
      console.log(newTokens);
      throw new Error('Tokens not consumed');
    }

    return cursor;
  };
  fn.tokens = tokens;
  return fn;
};

exports['default'] = simpleQuery;
module.exports = exports['default'];