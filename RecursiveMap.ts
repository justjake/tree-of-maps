/**
 * Maps from array-keys of a pre-defined length to values.
 *
 * In a normal map, array keys would be considered unique unless they are
 * references to the same object. The advantage of a FixedDepthTreeMap
 * over a normal Map<Array, V> is that in a FixedDepthTreeMap, keys
 * with the SameValueZero items at each index are equivalent.
 *
 * ```
 * const keys = [1, 2, 3]
 * const keys2 = [1, 2, 3]
 * const value = "potato"
 * const regularMap = new Map()
 * const treeMap = new UntypedFixedDepthTreeMap(keys.length)
 *
 * regularMap.set(keys, value)
 * regularMap.has(keys2) // -> false
 * regularMap.get(keys2) // -> undefined
 *
 * treeMap.set(keys, value)
 * treeMap.has(keys2) // -> true
 * treeMap.get(keys2) // -> "potato"
 * ```
 */
export class FixedDepthTreeMap<K extends unknown[], V> implements Map<K, V> {
  // Proving the nesting of our maps to the type system internally is
  // quite cumbersome, so instead we rely on loose types around Map<unknown, any>.
  private root = new Map<unknown, any>();

  constructor(public readonly keyLength: number) {
    if (keyLength < 1) {
      throw new Error(`Key length cannot be < 1 (was ${keyLength})`);
    }
  }

  // Collection methods

  clear() {
    this.root.clear();
  }

  delete(key: K): boolean {
    const branch = this.getBranch(key, false);
    if (!branch) {
      return false;
    }
    return branch.delete(this.getLeafKey(key));
    // TODO: remove branch from parent if branch.size === 0?
  }

  forEach(
    callbackfn: (value: V, key: K, map: Map<K, V>) => void,
    thisArg?: any
  ): void {
    for (const [key, value] of this.entries()) {
      callbackfn.apply(thisArg, [value, key, this]);
    }
  }

  get(key: K): V {
    const branch = this.getBranch(key, false);
    return branch && branch.get(this.getLeafKey(key));
  }

  has(key: K): boolean {
    const branch = this.getBranch(key, false);
    return Boolean(branch && branch.has(this.getLeafKey(key)));
  }

  set(key: unknown[], value: unknown) {
    this.getBranch(key, true).set(this.getLeafKey(key), value);
    return this;
  }

  get size(): number {
    if (this.keyLength === 1) {
      return this.root.size;
    }

    let size = 0;
    for (const [, branch] of this.depthFirstIterate(
      [],
      this.keyLength - 1,
      this.root
    )) {
      size = size + (branch as Map<unknown, unknown>).size;
    }
    return size;
  }

  // Iterable methods

  entries(): IterableIterator<[K, V]> {
    return this.depthFirstIterate(
      [],
      this.keyLength,
      this.root
    ) as IterableIterator<[K, V]>;
  }

  *keys() {
    for (const [key] of this.entries()) {
      yield key;
    }
  }

  *values() {
    for (const [, value] of this.entries()) {
      yield value;
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }

  // Well-known methods

  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }

  // Private methods

  /**
   * In our recursive map "tree" structure, a "branch" is the last map that holds the
   * terminal "leaf" values.
   */
  private getBranch(key: unknown[], create: true): Map<unknown, any>;
  private getBranch(
    key: unknown[],
    create: false
  ): Map<unknown, any> | undefined;
  private getBranch(
    key: unknown[],
    create: boolean
  ): Map<unknown, any> | undefined {
    let parent: Map<unknown, any> | undefined = this.root;

    for (let i = 0; i < this.keyLength - 1; i++) {
      const branchKey = key[i];
      let child: Map<unknown, any> | undefined = parent.get(branchKey);

      if (child) {
        parent = child;
        continue;
      }

      if (create) {
        child = new Map();
        parent.set(branchKey, child);
        parent = child;
        continue;
      }

      return undefined;
    }

    return parent;
  }

  /**
   * Iterate down the stems of a recursive map structure. Yields the [pathToTheNode, node].
   */
  private *depthFirstIterate(
    parentKeyPath: unknown[],
    maxKeyLength: number,
    parent: Map<unknown, any>
  ): IterableIterator<[unknown[], unknown]> {
    if (maxKeyLength === 0) {
      throw new Error(`maxKeyLength must be > 0 (was ${maxKeyLength})`);
    }

    if (parentKeyPath.length + 1 === maxKeyLength) {
      // Iterating leafs
      for (const [key, value] of parent) {
        const finalKeyPath = [...parentKeyPath, key];
        yield [finalKeyPath, value];
      }
      return;
    }

    // Iterating branches - recurse
    for (const [key, value] of parent) {
      const childKeyPath = [...parentKeyPath, key];
      yield* this.depthFirstIterate(childKeyPath, maxKeyLength, value);
    }
  }

  private getLeafKey(key: unknown[]) {
    return key[this.keyLength - 1];
  }
}

type First<T extends any[]> = T extends [infer I, ...infer L] ? I : never;
type ButFirst<T extends any[]> = T extends [infer I, ...infer L] ? L : never;

type Last<T extends any[]> = T extends [...infer I, infer L] ? L : never;
type UntilLast<T extends any[]> = T extends [...infer I, infer L] ? I : never;

type LastPathEntry<T extends any[]> = T extends [...infer I, infer L] ? [key: I, value: L] : never;

type DeepPaths<T, Depth extends number, counter extends any[] = [0]> = {
  [K in keyof T]: counter["length"] extends Depth
    ? [K, T[K]]
    : [K, ...DeepPaths<T[K], Depth, [0, ...counter]>];
}[keyof T];


type DeepKey<Shape extends Record<string, any>, Depth extends number> = UntilLast<DeepPaths<Shape, Depth>>
type DeepValue<Shape extends Record<string, any>, Depth extends number> = Last<DeepPaths<Shape, Depth>>
type DeepKeyValue<Shape extends Record<string, any>, Depth extends number> = LastPathEntry<DeepPaths<Shape, Depth>>

type MatchPrefix<Tuple extends any[], Prefix extends any[]> = Extract<Tuple, [...Prefix, any]>



interface BlockVal {
  type: "block";
}

interface ActivityVal {
  type: "activity";
}

interface CowVal {
  type: "cow";
}

type RecordMap = {
  cow: {
    petName1: CowVal;
    petName2: CowVal;
  };
  block: {
    [key: string]: BlockVal;
  };
  activity: {
    [key: string]: ActivityVal;
  };
  toad: {
    loveleyToad: CowVal;
    toadyBlock: BlockVal;
  };
};


type UnionToIntersection<U> = (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never

export class KeyConstrainedMap<Shape extends Record<string, any>, Depth extends number> {
	map: FixedDepthTreeMap<DeepKey<Shape, Depth>, DeepValue<Shape, Depth>>

	constructor(depth: Depth) {
		this.map = new FixedDepthTreeMap(depth)
	}

	set<K extends DeepKey<Shape, Depth>>(
    key: K,
    value: Last<MatchPrefix<DeepPaths<Shape, Depth>, K>>) {
		return this.map.set(key, value)
	}


	get<Path extends DeepPaths<Shape, Depth>>(key: UntilLast<Path>): Last<Path> {
		return this.map.get(key)
	}

	entries(): IterableIterator<DeepKeyValue<Shape, Depth>> {
		return this.map.entries() as any
	}
}
