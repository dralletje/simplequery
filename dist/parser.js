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
var propSymbol = Symbol('child of query cursor');
var fst = function fst(xs) {
  return xs[0];
};

var tokenError = function tokenError(token, message) {
  throw {
    message: 'Unexpected token ' + token.type + ', ' + message,
    character: token.column
  };
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

var parseQuery = function parseQuery(_x) {
  var _again = true;

  _function: while (_again) {
    var _ref = _x;
    cursor = tokens = _tokens = token = tail = isRoot = _tail = identifier = nextTail = _parseQuery = newTail = undefined;
    _again = false;
    var cursor = _ref.cursor;
    var tokens = _ref.tokens;

    if (tokens.length === 0) {
      throw new Error('This should never happen');
    }

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
          cursor: propSymbol,
          tokens: nextTail
        };
        _again = true;
        continue _function;

      case _TokenTypes2['default'].IDENTIFIER:
        _x = {
          cursor: propSymbol,
          tokens: tail
        };
        _again = true;
        continue _function;

      case _TokenTypes2['default'].ARRAY_START:
        var _parseQuery = parseQuery({
          cursor: rootSymbol,
          tokens: tail
        }),
            newTail = _parseQuery.tokens;

        _x = {
          cursor: propSymbol,
          tokens: newTail
        };
        _again = true;
        continue _function;

      case _TokenTypes2['default'].ARRAY_END:
        expectOneOfTokenTypes([_TokenTypes2['default'].ARRAY_START, _TokenTypes2['default'].EOF, _TokenTypes2['default'].PROP_ACCESS, _TokenTypes2['default'].ARRAY_END], fst(tail));
        return { cursor: cursor, tokens: tail };

      case _TokenTypes2['default'].EOF:
        return { cursor: cursor, tokens: tail };

      default:
        throw new Error('Unexpected token ' + token.type);
    }
  }
};

exports['default'] = function (tokens) {
  try {
    var _parseQuery2 = parseQuery({
      cursor: rootSymbol,
      tokens: tokens
    });

    var newTokens = _parseQuery2.tokens;

    if (newTokens.length !== 0) {
      console.log(newTokens);
      return {
        character: fst(newTokens).column,
        message: 'Tokens not consumed'
      };
    }
    return null;
  } catch (err) {
    return err;
  }
};

module.exports = exports['default'];