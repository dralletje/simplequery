'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lexer = require('./lexer');

var _lexer2 = _interopRequireDefault(_lexer);

var _parser = require('./parser');

var _parser2 = _interopRequireDefault(_parser);

var _executor = require('./executor');

var _executor2 = _interopRequireDefault(_executor);

var defGetFn = function defGetFn(dict, key) {
  return dict[key];
};

var simpleQuery = function simpleQuery(query) {
  var tokens = (0, _lexer2['default'])(Array.from(query));
  var err = (0, _parser2['default'])(tokens);
  if (err !== null) {
    throw new Error('Syntax error: ' + err.message + ' in query \'' + query + '\', character ' + err.character);
  }

  return function (_ref) {
    var getFromRoot = _ref.getFromRoot;
    var _ref$getProp = _ref.getProp;
    var getProp = _ref$getProp === undefined ? defGetFn : _ref$getProp;

    var _executeQuery = (0, _executor2['default'])(tokens, { getProp: getProp, getFromRoot: getFromRoot });

    var cursor = _executeQuery.cursor;

    return cursor;
  };
};

exports['default'] = simpleQuery;
module.exports = exports['default'];