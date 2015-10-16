// Not sure if this is to be called the lexer...
import Tokens from './TokenTypes'

const addToken = (tokens, type, payload = {}) =>
  tokens.concat([
    {
      type: type,
      ...payload,
    },
  ])

const hyped = (tail, tokens, column) => tokenType =>
  [
    tail,
    addToken(tokens, tokenType, {
      column: column,
    }),
    column + 1,
  ]

const propRegex = /[a-zA-Z0-9_$]/
const getIdentifierToken = ({query, tokens, tokenType, column}) => {
  const _index = query.findIndex(x => x.match(propRegex) === null)
  const index = _index === -1 ? query.length : _index

  const tokenValue = query.slice(0, index)
  const newTail = query.slice(index)

  return [
    newTail,
    addToken(tokens, tokenType, {
      value: tokenValue.join(''),
      column: column + index,
    }),
    column + index,
  ]
}

const parseQuery = (query, tokens = [], column = 1) => {
  if (query.length === 0) {
    return tokens.concat([{type: Tokens.EOF}])
  }

  const [first, ...tail] = query
  const myhype = hyped(tail, tokens, column)

  if (first === ']') {
    return parseQuery(...myhype(Tokens.ARRAY_END))
  }
  if (first === '[') {
    return parseQuery(...myhype(Tokens.ARRAY_START))
  }
  if (first === '.') {
    return parseQuery(...myhype(Tokens.PROP_ACCESS))
  }

  if (first.match(propRegex)) {
    return parseQuery(...getIdentifierToken({
      tokens, column, query,
      tokenType: Tokens.IDENTIFIER,
    }))
  }

  throw new Error(`Unexpected "${first}" in query at character ${column}`)
}

export default parseQuery
