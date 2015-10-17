// Executor? I know, weird name 😊

import Tokens from './TokenTypes'

const rootSymbol = Symbol('Root of query cursor')
const propSymbol = Symbol('child of query cursor')
const fst = xs => xs[0]

const tokenError = (token, message) => {
  throw {
    message: `Unexpected token ${token.type}, ${message}`,
    character: token.column,
  }
}
const expectToken = (tokenType, token) => {
  if (token.type !== tokenType) {
    tokenError(token, `expected ${tokenType}`)
  }
}

const expectOneOfTokenTypes = (tokenTypes, token) => {
  if (tokenTypes.indexOf(token.type) === -1) {
    tokenError(token, `expected one of ${tokenTypes.join(', ')}`)
  }
}

const parseQuery = ({cursor, tokens}) => {
  if (tokens.length === 0) {
    throw new Error('This should never happen')
  }

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
    return parseQuery({
      cursor: propSymbol,
      tokens: nextTail,
    })

  case Tokens.IDENTIFIER:
    return parseQuery({
      cursor: propSymbol,
      tokens: tail,
    })

  case Tokens.ARRAY_START:
    const {
      tokens: newTail,
    } = parseQuery({
      cursor: rootSymbol,
      tokens: tail,
    })

    return parseQuery({
      cursor: propSymbol,
      tokens: newTail,
    })

  case Tokens.ARRAY_END:
    expectOneOfTokenTypes([
      Tokens.ARRAY_START, Tokens.EOF,
      Tokens.PROP_ACCESS, Tokens.ARRAY_END,
    ], fst(tail))
    return {cursor, tokens: tail}

  case Tokens.EOF:
    return {cursor, tokens: tail}

  default:
    throw new Error(`Unexpected token ${token.type}`)
  }
}

export default (tokens) => {
  try {
    const {tokens: newTokens} = parseQuery({
      cursor: rootSymbol,
      tokens,
    })

    if (newTokens.length !== 0) {
      console.log(newTokens)
      return {
        character: fst(newTokens).column,
        message: 'Tokens not consumed',
      }
    }
    return null
  } catch (err) {
    return err
  }
}
