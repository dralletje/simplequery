import lexQuery from './lexer'
import parseQuery from './parser'
import executeQuery from './executor'

const defGetFn = (dict, key) => dict[key]

const simpleQuery = query => {
  const tokens = lexQuery(Array.from(query))
  const err = parseQuery(tokens)
  if (err !== null) {
    throw new Error(`Syntax error: ${err.message} in query '${query}', character ${err.character}`)
  }

  return ({
    getFromRoot,
    getProp = defGetFn,
  }) => {
    const {cursor} =
      executeQuery(tokens, {getProp, getFromRoot})

    return cursor
  }
}


export default simpleQuery
