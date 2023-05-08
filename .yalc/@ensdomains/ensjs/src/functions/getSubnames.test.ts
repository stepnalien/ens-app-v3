import { ENS } from '..'
import setup from '../tests/setup'
import { ENSJSError } from '../utils/errors'
import { decodeFuses } from '../utils/fuses'

let ensInstance: ENS
let spyOnRequest: any

beforeAll(async () => {
  ;({ ensInstance } = await setup())
  spyOnRequest = jest.spyOn(ensInstance.gqlInstance.client, 'request')
})

const testProperties = (obj: object, ...properties: string[]) =>
  properties.map((property) => expect(obj).toHaveProperty(property))

const makeSubdomain = () => ({
  id: '0x4495b77d4335be2b9a55ae7b9e7eb256b2bfab1f1d0e0cdf5e11cca93ba74fea',
  labelName: 'legacy',
  labelhash:
    '0xb7ccb6878fbded310d2d05350bca9c84568ecb568d4b626c83e0508c3193ce89',
  isMigrated: true,
  name: 'legacy.wrapped-with-subnames.eth',
  subdomainCount: 0,
  createdAt: '1671168105',
  owner: { id: '0xe6e340d132b5f46d1e472debcd681b2abc16e57e' },
  wrappedDomain: {
    fuses: 0,
    expiryDate: '1710479985',
    owner: { id: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc' },
  },
})

describe('getSubnames', () => {
  it('should get the subnames for a name ordered by createdAt in desc order', async () => {
    const result = await ensInstance.getSubnames({
      name: 'with-subnames.eth',
      pageSize: 10,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    })
    expect(result).toBeTruthy()
    expect(result.subnames.length).toBe(4)
    expect(result.subnameCount).toBe(4)
    expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
    expect(result.subnames[1].name).toEqual('xyz.with-subnames.eth')
    expect(result.subnames[2].name).toEqual('legacy.with-subnames.eth')
    expect(result.subnames[3].name).toEqual('test.with-subnames.eth')
    expect(
      result.subnames.every((subname, i, arr) => {
        if (arr[i + 1]) {
          return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
        }
        return true
      }),
    ).toBe(true)
    testProperties(
      result.subnames[0],
      'id',
      'labelName',
      'labelhash',
      'name',
      'isMigrated',
      'owner',
      'truncatedName',
    )
  })

  it('should get the subnames for a name ordered by createdAt in asc order', async () => {
    const result = await ensInstance.getSubnames({
      name: 'with-subnames.eth',
      pageSize: 10,
      orderBy: 'createdAt',
      orderDirection: 'asc',
    })
    expect(result).toBeTruthy()
    expect(result.subnames.length).toBe(4)
    expect(result.subnameCount).toBe(4)
    expect(result.subnames[0].name).toEqual('test.with-subnames.eth')
    expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
    expect(result.subnames[2].name).toEqual('xyz.with-subnames.eth')
    expect(result.subnames[3].name).toEqual('addr.with-subnames.eth')
    expect(
      result.subnames.every((subname, i, arr) => {
        if (arr[i + 1]) {
          return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
        }
        return true
      }),
    ).toBe(true)
    testProperties(
      result.subnames[0],
      'id',
      'labelName',
      'labelhash',
      'name',
      'isMigrated',
      'owner',
      'truncatedName',
    )
  })

  it('should get the subnames for a name by labelName in desc order', async () => {
    const result = await ensInstance.getSubnames({
      name: 'with-subnames.eth',
      pageSize: 10,
      orderBy: 'labelName',
      orderDirection: 'desc',
    })
    expect(result).toBeTruthy()
    expect(result.subnames.length).toBe(4)
    expect(result.subnameCount).toBe(4)
    expect(result.subnames[0].name).toEqual('xyz.with-subnames.eth')
    expect(result.subnames[1].name).toEqual('test.with-subnames.eth')
    expect(result.subnames[2].name).toEqual('legacy.with-subnames.eth')
    expect(result.subnames[3].name).toEqual('addr.with-subnames.eth')
    testProperties(
      result.subnames[0],
      'id',
      'labelName',
      'labelhash',
      'name',
      'isMigrated',
      'owner',
      'truncatedName',
    )
  })

  it('should get the subnames for a name by labelName in asc order', async () => {
    const result = await ensInstance.getSubnames({
      name: 'with-subnames.eth',
      pageSize: 10,
      orderBy: 'labelName',
      orderDirection: 'asc',
    })
    expect(result).toBeTruthy()
    expect(result.subnames.length).toBe(4)
    expect(result.subnameCount).toBe(4)
    expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
    expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
    expect(result.subnames[2].name).toEqual('test.with-subnames.eth')
    expect(result.subnames[3].name).toEqual('xyz.with-subnames.eth')
    testProperties(
      result.subnames[0],
      'id',
      'labelName',
      'labelhash',
      'name',
      'isMigrated',
      'owner',
      'truncatedName',
    )
  })
  describe('wrapped subnames', () => {
    it('should return fuses', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })

      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].fuses).toBeDefined()
    })
    it('should return expiry as undefined if 0', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-expiring-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })

      expect(result).toBeTruthy()
      expect(result.subnames[1].expiryDate).toBeUndefined()
    })
    it('should return expiry', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-expiring-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })

      expect(result).toBeTruthy()
      expect(result.subnames[2].expiryDate).toBeInstanceOf(Date)
    })
    it('should return owner as undefined, fuses as 0, and pccExpired as true if pcc expired', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-expiring-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })

      expect(result).toBeTruthy()
      expect(result.subnames[0].owner).toBeUndefined()
      expect(result.subnames[0].fuses).toStrictEqual(decodeFuses(0))
      expect(result.subnames[0].pccExpired).toBe(true)
    })
  })

  describe('with pagination', () => {
    it('should get paginated subnames for a name ordered by createdAt in desc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'with-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
      expect(result.subnames[1].name).toEqual('xyz.with-subnames.eth')
      expect(result.subnames[2].name).toEqual('legacy.with-subnames.eth')
      expect(result.subnames[3].name).toEqual('test.with-subnames.eth')
      expect(
        result.subnames.every((subname, i, arr) => {
          if (arr[i + 1]) {
            return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
          }
          return true
        }),
      ).toBe(true)
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    it('should get the subnames for a name ordered by createdAt in asc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'with-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'asc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('test.with-subnames.eth')
      expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
      expect(result.subnames[2].name).toEqual('xyz.with-subnames.eth')
      expect(result.subnames[3].name).toEqual('addr.with-subnames.eth')
      expect(
        result.subnames.every((subname, i, arr) => {
          if (arr[i + 1]) {
            return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
          }
          return true
        }),
      ).toBe(true)
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    it('should get the subnames for a name by labelName in desc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'with-subnames.eth',
        pageSize: 10,
        orderBy: 'labelName',
        orderDirection: 'desc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('xyz.with-subnames.eth')
      expect(result.subnames[1].name).toEqual('test.with-subnames.eth')
      expect(result.subnames[2].name).toEqual('legacy.with-subnames.eth')
      expect(result.subnames[3].name).toEqual('addr.with-subnames.eth')
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    it('should get the subnames for a name by labelName in asc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'with-subnames.eth',
        pageSize: 10,
        orderBy: 'labelName',
        orderDirection: 'asc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
      expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
      expect(result.subnames[2].name).toEqual('test.with-subnames.eth')
      expect(result.subnames[3].name).toEqual('xyz.with-subnames.eth')
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    describe('with pagination', () => {
      it('should get paginated subnames for a name ordered by createdAt in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('xyz.with-subnames.eth')
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('legacy.with-subnames.eth')
        expect(result2.subnames[1].name).toEqual('test.with-subnames.eth')
        expect(
          result2.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name ordered by createdAt in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'asc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('test.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          page: 0,
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
        })

        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('xyz.with-subnames.eth')
        expect(result2.subnames[1].name).toEqual('addr.with-subnames.eth')
        expect(
          result2.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'desc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('xyz.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('test.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('legacy.with-subnames.eth')
        expect(result2.subnames[1].name).toEqual('addr.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'asc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')

        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )

        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('test.with-subnames.eth')
        expect(result2.subnames[1].name).toEqual('xyz.with-subnames.eth')

        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })
    })

    describe('With search query', () => {
      it('should get the searched subnames for a name ordered by createdAt in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 10,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get the searched subnames for a name ordered by createdAt in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          page: 0,
          pageSize: 10,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('legacy.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('addr.with-subnames.eth')
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get the subnames for a name by labelName in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 10,
          orderBy: 'labelName',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('legacy.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('addr.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get the subnames for a name by labelName in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 10,
          orderBy: 'labelName',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
        expect(result.subnames[1].name).toEqual('legacy.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })
    })

    describe('with search query and pagination', () => {
      it('should get paginated subnames for a name ordered by createdAt in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
          search: 'a',
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('legacy.with-subnames.eth')
        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name ordered by createdAt in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('legacy.with-subnames.eth')
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          page: 0,
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
          search: 'a',
        })

        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('addr.with-subnames.eth')

        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('legacy.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
          search: 'a',
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('addr.with-subnames.eth')
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('addr.with-subnames.eth')

        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )

        const result2 = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
          search: 'a',
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual('legacy.with-subnames.eth')

        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })
    })
  })

  describe('wrapped', () => {
    it('should get the subnames for a name ordered by createdAt in desc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('addr.wrapped-with-subnames.eth')
      expect(result.subnames[1].name).toEqual('xyz.wrapped-with-subnames.eth')
      expect(result.subnames[2].name).toEqual(
        'legacy.wrapped-with-subnames.eth',
      )
      expect(result.subnames[3].name).toEqual('test.wrapped-with-subnames.eth')
      expect(
        result.subnames.every((subname, i, arr) => {
          if (arr[i + 1]) {
            return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
          }
          return true
        }),
      ).toBe(true)
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    it('should get the subnames for a name ordered by createdAt in asc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-subnames.eth',
        pageSize: 10,
        orderBy: 'createdAt',
        orderDirection: 'asc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('test.wrapped-with-subnames.eth')
      expect(result.subnames[1].name).toEqual(
        'legacy.wrapped-with-subnames.eth',
      )
      expect(result.subnames[2].name).toEqual('xyz.wrapped-with-subnames.eth')
      expect(result.subnames[3].name).toEqual('addr.wrapped-with-subnames.eth')
      expect(
        result.subnames.every((subname, i, arr) => {
          if (arr[i + 1]) {
            return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
          }
          return true
        }),
      ).toBe(true)
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    it('should get the subnames for a name by labelName in desc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-subnames.eth',
        pageSize: 10,
        orderBy: 'labelName',
        orderDirection: 'desc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('xyz.wrapped-with-subnames.eth')
      expect(result.subnames[1].name).toEqual('test.wrapped-with-subnames.eth')
      expect(result.subnames[2].name).toEqual(
        'legacy.wrapped-with-subnames.eth',
      )
      expect(result.subnames[3].name).toEqual('addr.wrapped-with-subnames.eth')
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    it('should get the subnames for a name by labelName in asc order', async () => {
      const result = await ensInstance.getSubnames({
        name: 'wrapped-with-subnames.eth',
        pageSize: 10,
        orderBy: 'labelName',
        orderDirection: 'asc',
      })
      expect(result).toBeTruthy()
      expect(result.subnames.length).toBe(4)
      expect(result.subnameCount).toBe(4)
      expect(result.subnames[0].name).toEqual('addr.wrapped-with-subnames.eth')
      expect(result.subnames[1].name).toEqual(
        'legacy.wrapped-with-subnames.eth',
      )
      expect(result.subnames[2].name).toEqual('test.wrapped-with-subnames.eth')
      expect(result.subnames[3].name).toEqual('xyz.wrapped-with-subnames.eth')
      testProperties(
        result.subnames[0],
        'id',
        'labelName',
        'labelhash',
        'name',
        'isMigrated',
        'owner',
        'truncatedName',
      )
    })

    describe('with pagination', () => {
      it('should get paginated subnames for a name ordered by createdAt in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual('xyz.wrapped-with-subnames.eth')
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(result2.subnames[1].name).toEqual(
          'test.wrapped-with-subnames.eth',
        )
        expect(
          result2.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name ordered by createdAt in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'asc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'test.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          page: 0,
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
        })

        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'xyz.wrapped-with-subnames.eth',
        )
        expect(result2.subnames[1].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        expect(
          result2.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'desc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual('xyz.wrapped-with-subnames.eth')
        expect(result.subnames[1].name).toEqual(
          'test.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(result2.subnames[1].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'asc',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )

        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )

        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 2,
          orderBy: 'labelName',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(2)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'test.wrapped-with-subnames.eth',
        )
        expect(result2.subnames[1].name).toEqual(
          'xyz.wrapped-with-subnames.eth',
        )

        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })
    })

    describe('With search query', () => {
      it('should get the searched subnames for a name ordered by createdAt in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 10,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt >= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get the searched subnames for a name ordered by createdAt in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          page: 0,
          pageSize: 10,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get the subnames for a name by labelName in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 10,
          orderBy: 'labelName',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get the subnames for a name by labelName in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 10,
          orderBy: 'labelName',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(2)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        expect(result.subnames[1].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })
    })

    describe('with search query and pagination', () => {
      it('should get paginated subnames for a name ordered by createdAt in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'createdAt',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
          search: 'a',
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name ordered by createdAt in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        expect(
          result.subnames.every((subname, i, arr) => {
            if (arr[i + 1]) {
              return (subname as any).createdAt <= (arr[i + 1] as any).createdAt
            }
            return true
          }),
        ).toBe(true)
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          page: 0,
          pageSize: 2,
          orderBy: 'createdAt',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
          search: 'a',
        })

        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )

        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in desc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'desc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'desc',
          lastSubnames: result.subnames,
          search: 'a',
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )
        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })

      it('should get paginated subnames for a name by labelName in asc order', async () => {
        const result = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'asc',
          search: 'a',
        })
        expect(result).toBeTruthy()
        expect(result.subnames.length).toBe(1)
        expect(result.subnameCount).toBe(4)
        expect(result.subnames[0].name).toEqual(
          'addr.wrapped-with-subnames.eth',
        )

        testProperties(
          result.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )

        const result2 = await ensInstance.getSubnames({
          name: 'wrapped-with-subnames.eth',
          pageSize: 1,
          orderBy: 'labelName',
          orderDirection: 'asc',
          lastSubnames: result.subnames,
          search: 'a',
        })
        expect(result2).toBeTruthy()
        expect(result2.subnames.length).toBe(1)
        expect(result2.subnameCount).toBe(4)
        expect(result2.subnames[0].name).toEqual(
          'legacy.wrapped-with-subnames.eth',
        )

        testProperties(
          result2.subnames[0],
          'id',
          'labelName',
          'labelhash',
          'name',
          'isMigrated',
          'owner',
          'truncatedName',
        )
      })
    })
  })

  describe('indexing errors', () => {
    beforeEach(() => {
      spyOnRequest.mockImplementation(() => ({
        _meta: {
          hasIndexingErrors: true,
          block: { number: 271 },
        },
        domain: {
          subdomainCount: 1,
          subdomains: [makeSubdomain()],
        },
      }))
    })

    it('should throw an error if meta data returns hasIndexingErrors', async () => {
      try {
        const result = await ensInstance.getSubnames({
          name: 'with-subnames.eth',
          pageSize: 10,
          orderBy: 'createdAt',
          orderDirection: 'desc',
        })
        expect(result).toBeFalsy()
      } catch (e) {
        expect(e).toBeInstanceOf(ENSJSError)
      }
    })
  })
})
