// Executor? I know, weird name 😊

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _TokenTypes = require('./TokenTypes');

var _TokenTypes2 = _interopRequireDefault(_TokenTypes);

var rootSymbol = Symbol('Root of query cursor');

// TODO: Find these 'syntax errors' on lexer time
var tokenError = function tokenError(token, message) {
  throw new Error('Syntax error: Unexpected token ' + token.type + ', ' + message + ', at character ' + token.column);
};
var expectToken = function expectToken(tokenType, token) {
  if (token.type !== tokenType) {
    tokenError(token, 'expected ' + tokenType);
  }
};

var expectOneOfTokenTypes = function expectOneOfTokenTypes(tokenTypes, token) {
  if (tokenTypes.indexOf(token.type) === -1) {
    tokenError(token, 'expected one of ' + tokenTypes.join(', '));
  }
};

var executeQuery = function executeQuery(_x, _x2) {
  var _again = true;

  _function: while (_again) {
    var _ref = _x,
        env = _x2;
    cursor = tokens = getFromRoot = getProp = _tokens = token = tail = isRoot = _tail = identifier = nextTail = _executeQuery = derivedKey = newTail = undefined;
    var cursor = _ref.cursor;
    var tokens = _ref.tokens;
    _again = false;

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
    if (isRoot && token.type !== _TokenTypes2['default'].IDENTIFIER && token.type !== _TokenTypes2['default'].ARRAY_START) {
      tokenError(token, 'expected ' + _TokenTypes2['default'].IDENTIFIER + ' or ' + _TokenTypes2['default'].ARRAY_START);
    }

    switch (token.type) {

      case _TokenTypes2['default'].PROP_ACCESS:
        var _tail = _toArray(tail),
            identifier = _tail[0],
            nextTail = _tail.slice(1);

        expectToken(_TokenTypes2['default'].IDENTIFIER, identifier);
        _x = {
          cursor: getProp(cursor, identifier.value),
          tokens: nextTail
        };
        _x2 = env;
        _again = true;
        continue _function;

      case _TokenTypes2['default'].IDENTIFIER:
        _x = {
          cursor: getFromRoot(token.value),
          tokens: tail
        };
        _x2 = env;
        _again = true;
        continue _function;

      case _TokenTypes2['default'].ARRAY_START:
        var _executeQuery = executeQuery({
          cursor: rootSymbol,
          tokens: tail
        }, env),
            derivedKey = _executeQuery.cursor,
            newTail = _executeQuery.tokens;

        _x = {
          cursor:
          // Array start can also be on the 'root' or the query
          // eg. '[somevar].stuff' is valid
          isRoot ? getFromRoot(derivedKey) : getProp(cursor, derivedKey),
          tokens: newTail
        };
        _x2 = env;
        _again = true;
        continue _function;

      case _TokenTypes2['default'].ARRAY_END:
        expectOneOfTokenTypes([_TokenTypes2['default'].ARRAY_START, _TokenTypes2['default'].EOF, _TokenTypes2['default'].PROP_ACCESS, _TokenTypes2['default'].ARRAY_END], tail[0]);
        return { cursor: cursor, tokens: tail };

      case _TokenTypes2['default'].EOF:
        return { cursor: cursor, tokens: tail };

      default:
        throw new Error('Unexpected token ' + token.type);
    }
  }
};

exports['default'] = function (tokens, env) {
  return executeQuery({
    cursor: rootSymbol,
    tokens: tokens
  }, env);
};

module.exports = exports['default'];