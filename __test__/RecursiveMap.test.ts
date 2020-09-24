import { UntypedFixedDepthTreeMap } from "../RecursiveMap";

function exampleKeys(keyLength: number): Array<unknown[]> {
  return [
    // empty array should always work
    [],
    // very long array should work, only first N used
    new Array(keyLength * 5).fill("potato"),
    // Normal kind.
    new Array(keyLength).fill(1).map((_, i) => i),
  ];
}

function trimOrExtendKey(key: unknown[], keyLength: number): unknown[] {
  if (key.length === keyLength) {
    return key;
  }

  const result = [];
  for (let i = 0; i < keyLength; i++) {
    result[i] = key[i];
  }
  return result;
}

describe(trimOrExtendKey, () => {
  it("trims a long key to the keyLength", () => {
    const long = [0, 1, 2, 3, 4, 5];
    const trimmed = [0, 1, 2];
    expect(trimOrExtendKey(long, 3)).toEqual(trimmed);
  });

  it("extends a short key with undefined to the keyLength", () => {
    const short = [0, 1, 2];
    const extended = [0, 1, 2, undefined, undefined];
    expect(trimOrExtendKey(short, 5)).toEqual(extended);
  });
});

describe(UntypedFixedDepthTreeMap, () => {
  let map = new UntypedFixedDepthTreeMap(1);
  [1, 2, 3, 4, 10].forEach((keyLength) => {
    describe(`UntypedFixedDepthTreeMap(keyLength: ${keyLength})`, () => {
      beforeEach(() => {
        map = new UntypedFixedDepthTreeMap(keyLength);
      });

      describe("get, set", () => {
        it("can get a key with the same values in its indexes", () => {
          exampleKeys(keyLength).forEach((key1) => {
            const key2 = [...key1];
            const value = "potato";
            map.set(key1, value);
            expect(map.get(key2)).toEqual(value);
          });
        });
      });

      describe("has", () => {
        it("returns true for a key set", () => {
          exampleKeys(keyLength).forEach((key) => {
            map.set(key, true);
            expect(map.has(key)).toBe(true);
          });
        });

        it("returns false for a deleted key", () => {
          exampleKeys(keyLength).forEach((key) => {
            map.set(key, true);
            map.delete(key);
            expect(map.has(key)).toBe(false);
          });
        });
      });

      describe("size, delete", () => {
        it("returns the number of values set", () => {
          const keys = exampleKeys(keyLength);
          keys.forEach((key) => map.set(key, key));
          expect(map.size).toBe(keys.length);
        });

        it("doesn’t count deleted keys", () => {
          const keys = exampleKeys(keyLength);
          keys.forEach((key) => map.set(key, key));
          map.delete(keys[0]);
          expect(map.size).toBe(keys.length - 1);
        });

        it("doesn't double-count keys", () => {
          const keys = exampleKeys(keyLength);
          keys.forEach((key) => map.set(key, key));
          keys.forEach((key) => map.set(key, key));
          expect(map.size).toBe(keys.length);
        });
      });

      describe("clear", () => {
        it("makes the size zero", () => {
          const keys = exampleKeys(keyLength);
          keys.forEach((key) => map.set(key, key));
          map.clear();
          expect(map.size).toBe(0);
        });

        it("has() and get() behave like every key was deleted", () => {
          const keys = exampleKeys(keyLength);
          keys.forEach((key) => map.set(key, key));
          map.clear();
          keys.forEach((key) => expect(map.has(key)).toBe(false));
          keys.forEach((key) => expect(map.get(key)).toBe(undefined));
        });
      });

      describe("entries", () => {
        it("iterates through key, value pairs in insertion order", () => {
          const keys = exampleKeys(keyLength);
          keys.forEach((key, i) => map.set(key, i));
          let i = 0;
          for (const [key, value] of map.entries()) {
            expect(key).toEqual(trimOrExtendKey(keys[i], keyLength));
            expect(value).toBe(i);
            i++;
          }
        });
      });

      // end keyLength
    });
  });
});
