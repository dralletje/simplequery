// Not sure if this is to be called the lexer...
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _TokenTypes = require('./TokenTypes');

var _TokenTypes2 = _interopRequireDefault(_TokenTypes);

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
      return tokens.concat([{
        type: _TokenTypes2['default'].EOF,
        column: column
      }]);
    }

    var _query = _toArray(query);

    var first = _query[0];

    var tail = _query.slice(1);

    var myhype = hyped(tail, tokens, column);

    if (first === ']') {
      _arguments = _toConsumableArray(myhype(_TokenTypes2['default'].ARRAY_END));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }
    if (first === '[') {
      _arguments = _toConsumableArray(myhype(_TokenTypes2['default'].ARRAY_START));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }
    if (first === '.') {
      _arguments = _toConsumableArray(myhype(_TokenTypes2['default'].PROP_ACCESS));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }

    if (first.match(propRegex)) {
      _arguments = _toConsumableArray(getIdentifierToken({
        tokens: tokens, column: column, query: query,
        tokenType: _TokenTypes2['default'].IDENTIFIER
      }));
      _x4 = _arguments[0];
      _again = true;
      continue _function;
    }

    throw new Error('Unexpected "' + first + '" in query at character ' + column);
  }
};

exports['default'] = parseQuery;
module.exports = exports['default'];