class UntypedTreeMap implements Map<unknown[], unknown> {
	private root = new Map<unknown, any>()

	constructor(public keyLength: number) {
		if (keyLength < 1) {
			throw new Error(`Key length cannot be < 1 (was ${keyLength})`)
		}
	}

	// Collection methods

	clear() {
		this.root.clear()
	}

	delete(key: unknown[]) {
		const branch = this.getBranch(key, false)
		if (!branch) {
			return false
		}
		return branch.delete(this.getLeafKey(key))
	}

	forEach(
		callbackfn: (
			value: unknown,
			key: unknown[],
			map: Map<unknown[], unknown>
		) => void,
		thisArg?: any
	): void {
		for (const [key, value] of this.depthFirstIterate(
			[],
			this.keyLength,
			this.root
		)) {
			callbackfn.apply(thisArg, [value, key, this])
		}
	}

	get(key: unknown[]) {
		const branch = this.getBranch(key, false)
		return branch && branch.get(this.getLeafKey(key))
	}

	has(key: unknown[]) {
		const branch = this.getBranch(key, false)
		return Boolean(branch && branch.has(this.getLeafKey(key)))
	}

	set(key: unknown[], value: unknown) {
		this.getBranch(key, true).set(this.getLeafKey(key), value)
		return this
	}

	get size() {
		let size = 0
		for (const [, branch] of this.depthFirstIterate(
			[],
			this.keyLength - 1,
			this.root
		)) {
			size = size + branch.size
		}
		return size
	}

	// Iterable methods

	entries(): IterableIterator<[unknown[], unknown]> {
		return this.depthFirstIterate([], this.keyLength, this.root)
	}

	*keys() {
		for (const [key] of this.entries()) {
			yield key
		}
	}

	*values() {
		for (const [, value] of this.entries()) {
			yield value
		}
	}

	[Symbol.iterator]() {
		return this.entries()
	}

	// Well-known methods

	get [Symbol.toStringTag]() {
		return "TreeMap"
	}

	// Private methods

	/**
	 * In our recursive map "tree" structure, a "branch" is the last map that holds the
	 * terminal "leaf" values.
	 */
	private getBranch(key: unknown[], create: true): Map<unknown, any>
	private getBranch(
		key: unknown[],
		create: false
	): Map<unknown, any> | undefined
	private getBranch(
		key: unknown[],
		create: boolean
	): Map<unknown, any> | undefined {
		let parent: Map<unknown, any> | undefined = this.root

		for (let i = 0; i < this.keyLength - 1; i++) {
			const branchKey = key[i]
			let child: Map<unknown, any> | undefined = parent.get(branchKey)

			if (child) {
				parent = child
				continue
			}

			if (create) {
				child = new Map()
				parent.set(branchKey, child)
				parent = child
				continue
			}

			return undefined
		}

		return parent
	}

	/**
	 * Iterate down the stems of a recursive map structure. Yields the [pathToTheNode, node].
	 */
	private *depthFirstIterate(
		parentKeyPath: unknown[],
		maxKeyLength: number,
		parent: Map<unknown, any>
	) {
		if (parentKeyPath.length + 1 === maxKeyLength) {
			// Iterating leafs
			for (const [key, value] of parent) {
				const finalKeyPath = [...parentKeyPath, key]
				yield [finalKeyPath, value]
			}
			return
		}

		// Iterating branches - recurse
		for (const [key, value] of parent) {
			const childKeyPath = [...parentKeyPath, key]
			yield* this.depthFirstIterate(childKeyPath, maxKeyLength, value)
		}
	}

	private getLeafKey(key: unknown[]) {
		return key[this.keyLength - 1]
	}
}
