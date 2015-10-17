const state = {
  self: 'self',

  one: 1,
  two: 2,
  numbers: {
    one: 1,
    two: 2,
  },
  literal: {
    one: 'two',
    two: 'one',
  },
  literalByNum: {
    1: 'one',
    2: 'two',
  },
}
const store = {
  getFromRoot: (key) => state[key],
}

const describe = (name, uselessfn) =>
  uselessfn((description, fn) => {
    try {
      fn()
      console.log(`[GOOD] it ${description}`)
    } catch (err) {
      console.log(`[ BAD] it ${description}`)
      console.log(err.stack)
    }
  })

const expect = value => ({
  toBe: otherval => {
    if (value !== otherval) {
      throw new Error(`Expected ${value} to be ${otherval}`)
    }
  },
  toThrow: _ => {
    try {
      value()
    } catch (err) {
      return
    }
    throw new Error(`Expected ${value} to throw`)
  },
})

const simpleQuery = require('./dist/simplequery')
// describe('simplequery - tokenize', it => {
//   it('should return the right tokens', _ => {
//     expect(simpleQuery('header')(store)).toHaveTokens
//   })
// })

describe('simplequery - get from store', it => {
  it('should find single depth value', _ => {
    expect(simpleQuery('one')(store)).toBe(1)
    expect(simpleQuery('numbers')(store)).toBe(state.numbers)
  })

  it('should find double depth key', _ => {
    expect(simpleQuery('numbers.one')(store)).toBe(1)
    expect(simpleQuery('literal.two')(store)).toBe('one')
  })

  it('should find by other value', _ => {
    expect(simpleQuery('literalByNum[numbers.one]')(store)).toBe('one')
  })

  it('should support a lot of nesting', _ => {
    expect(simpleQuery('literal[literal[literal[literal[literal.one]]]]')(store)).toBe('two')
  })

  it('should support a numeric key', _ => {
    expect(simpleQuery('literalByNum.1')(store)).toBe('one')
  })

  it('should support derived key access on the root', _ => {
    expect(simpleQuery('[literalByNum.1]')(store)).toBe(1)
  })

  it('should support derived key access on the root xtreme', _ => {
    expect(simpleQuery('[[[[[self]]]]]')(store)).toBe('self')
  })

  const badQueries = [
    '[]',
    '',
    '.test',
    '[.test]',
    'test[',
    ']',
    '[good]bad',
  ]

  badQueries.forEach(query => {
    it(`should throw with query '${query}'`, _ => {
      expect(() => simpleQuery(query)).toThrow()
    })
  })
})
