const Tokens = {
  IDENTIFIER: 'IDENTIFIER',
  ARRAY_END: 'ARRAY_END',
  ARRAY_START: 'ARRAY_START',
  PROP_ACCESS: 'PROP_ACCESS',
}

const addToken = (tokens, type, payload={}) =>
  tokens.concat([
    {
      type: type,
      ...payload,
    }
  ])

const hyped = (tail, tokens, column) => tokenType =>
    [tail, addToken(tokens, tokenType), column+1]

const propRegex = /[a-zA-Z0-9_]/

const parseQuery = (query, tokens=[], column=1) => {
  if (query.length === 0) {
    return tokens
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
    const _index = tail.findIndex(x => x.match(propRegex) === null)
    const index = _index === -1 ? tail.length : _index

    const tokenValue = tail.slice(0, index)
    const newTail = tail.slice(index)

    return parseQuery(newTail, addToken(tokens, Tokens.IDENTIFIER, {
      value: first + tokenValue.join(''),
    }), column + index)
  }

  throw new Error(`Unexpected "${first}" in query at character ${column}`)
}

const executeQuery = ({cursor, tokens}, env) => {
  const {store, getFn} = env

  if (tokens.length === 0) {
    return {cursor, tokens}
  }

  const [token, ...tail] = tokens
  switch (token.type) {
  case Tokens.PROP_ACCESS:
    // Do nothing, hahaha :')
    return executeQuery({cursor, tokens: tail}, env)
  case Tokens.IDENTIFIER:
    return executeQuery({
      cursor: getFn(cursor, token.value),
      tokens: tail,
    }, env)
  case Tokens.ARRAY_START:
    const {cursor: derivedKey, tokens: newTail} = executeQuery({
      cursor: store,
      tokens: tail,
    }, env)
    return executeQuery({
      cursor: getFn(cursor, derivedKey),
      tokens: newTail,
    }, store)
  case Tokens.ARRAY_END:
    return {cursor, tokens: tail}
  }
}

const defGetFn = (dict, key) => dict[key]

const simpleQuery = query => {
  const tokens = parseQuery(query)

  return (store, getFn = defGetFn) => {
    const {cursor, tokens: newTokens} = executeQuery({
      cursor: store,
      tokens,
    }, {store, getFn})

    if (newTokens.length !== 0) {
      console.log(newTokens)
      throw new Error('Tokens not consumed')
    }

    return cursor
  }
}


export default simpleQuery
