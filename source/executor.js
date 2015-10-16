// Executor? I know, weird name 😊

import Tokens from './TokenTypes'

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

export default executeQuery
