import parseQuery from './lexer'
import executeQuery from './executor'

const defGetFn = (dict, key) => dict[key]

const simpleQuery = query => {
  const tokens = parseQuery(Array.from(query))

  return ({
    getFromRoot,
    getProp = defGetFn,
  }) => {
    const {cursor, tokens: newTokens} =
      executeQuery(tokens, {getProp, getFromRoot})

    // TODO: Put this in lexer/compiler land
    if (newTokens.length !== 0) {
      console.log(newTokens)
      throw new Error('Tokens not consumed')
    }

    return cursor
  }
}


export default simpleQuery
