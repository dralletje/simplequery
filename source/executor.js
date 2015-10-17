// Executor? I know, weird name 😊

import Tokens from './TokenTypes'

const rootSymbol = Symbol('Root of query cursor')

const executeQuery = ({cursor, tokens}, env) => {
  const {getFromRoot, getProp} = env
  const [token, ...tail] = tokens

  // Only two tokens are allowed at root now
  const isRoot = cursor === rootSymbol

  switch (token.type) {

  case Tokens.PROP_ACCESS:
    const [identifier, ...nextTail] = tail
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
      cursor: rootSymbol,
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
  }
}

export default (tokens, env) =>
  executeQuery({
    cursor: rootSymbol,
    tokens,
  }, env)
