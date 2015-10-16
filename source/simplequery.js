const Tokens = {
  IDENTIFIER: 'IDENTIFIER',
  ARRAY_END: 'ARRAY_END',
  ARRAY_START: 'ARRAY_START',
  PROP_ACCESS: 'PROP_ACCESS',
  EOF: 'EOF',
}

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

const rootSymbol = Symbol('Root of query cursor')

// TODO: Find these 'syntax errors' on lexer time
const tokenError = (token, message) => {
  throw new Error(
    `Syntax error: Unexpected token ${token.type}, ${message}, at character ${token.column}`
  )
}
const expectToken = (tokenType, token) => {
  if (token.type !== tokenType) {
    tokenError(`expected ${tokenType}`)
  }
}

const executeQuery = ({cursor = rootSymbol, tokens}, env) => {
  if (tokens.length === 0) {
    throw new Error('This should never happen')
  }

  const {getFromRoot, getProp} = env
  const [token, ...tail] = tokens

  // Only two tokens are allowed at root now
  const isRoot = cursor === rootSymbol
  if (
    isRoot &&
    token.type !== Tokens.IDENTIFIER &&
    token.type !== Tokens.ARRAY_START
  ) {
    tokenError(token, `expected ${Tokens.IDENTIFIER} or ${Tokens.ARRAY_START}`)
  }

  switch (token.type) {

  case Tokens.PROP_ACCESS:
    const [identifier, ...nextTail] = tail
    expectToken(Tokens.IDENTIFIER, identifier)
    return executeQuery({
      cursor: getProp(cursor, identifier.value),
      tokens: nextTail,
    }, env)

  case Tokens.IDENTIFIER:
    return executeQuery({
      cursor: getFromRoot(token.value),
      tokens: tail,
    }, env)

  case Tokens.ARRAY_START:
    const {
      cursor: derivedKey,
      tokens: newTail,
    } = executeQuery({
      tokens: tail,
    }, env)

    return executeQuery({
      cursor: (
        // Array start can also be on the 'root' or the query
        // eg. '[somevar].stuff' is valid
        isRoot
        ? getFromRoot(derivedKey)
        : getProp(cursor, derivedKey)
      ),
      tokens: newTail,
    }, env)

  case Tokens.ARRAY_END:
    return {cursor, tokens: tail}

  case Tokens.EOF:
    return {cursor, tokens: tail}

  default:
    throw new Error(`Unexpected token ${token.type}`)
  }
}

const defGetFn = (dict, key) => dict[key]

const simpleQuery = query => {
  const tokens = parseQuery(Array.from(query))

  const fn = ({
    getFromRoot,
    getProp = defGetFn,
  }) => {
    const {cursor, tokens: newTokens} = executeQuery(
      {tokens},
      {getProp, getFromRoot}
    )

    if (newTokens.length !== 0) {
      console.log(newTokens)
      throw new Error('Tokens not consumed')
    }

    return cursor
  }
  fn.tokens = tokens
  return fn
}


export default simpleQuery
