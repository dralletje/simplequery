const store = {
  header: 1,
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

const describe = (name, fn) =>
  fn((description, fn) => {
    try {
      fn()
      console.log(`[GOOD] it ${description}`)
    } catch (err) {
      console.log(`[ BAD] it ${description}`)
      console.log(err.message)
    }
  })

const expect = value => ({
  toBe: otherval => {
    if (value !== otherval) {
      throw new Error(`Expected ${value} to be ${otherval}`)
    }
  }
})

import simpleQuery from './simplequery'
describe('simplequery', it => {
  it('should find single depth value', _ => {
    expect(simpleQuery('header')(store)).toBe(1)
    expect(simpleQuery('numbers')(store)).toBe(store.numbers)
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
})
