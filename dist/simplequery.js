'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lexer = require('./lexer');

var _lexer2 = _interopRequireDefault(_lexer);

var _executor = require('./executor');

var _executor2 = _interopRequireDefault(_executor);

var defGetFn = function defGetFn(dict, key) {
  return dict[key];
};

var simpleQuery = function simpleQuery(query) {
  var tokens = (0, _lexer2['default'])(Array.from(query));

  return function (_ref) {
    var getFromRoot = _ref.getFromRoot;
    var _ref$getProp = _ref.getProp;
    var getProp = _ref$getProp === undefined ? defGetFn : _ref$getProp;

    var _executeQuery = (0, _executor2['default'])({ tokens: tokens }, { getProp: getProp, getFromRoot: getFromRoot });

    var cursor = _executeQuery.cursor;
    var newTokens = _executeQuery.tokens;

    // TODO: Put this in lexer/compiler land
    if (newTokens.length !== 0) {
      console.log(newTokens);
      throw new Error('Tokens not consumed');
    }

    return cursor;
  };
};

exports['default'] = simpleQuery;
module.exports = exports['default'];