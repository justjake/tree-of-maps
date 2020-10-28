# tree-of-maps

Goals:

Explore using recurive `Map` structure to model paths. This could be useful for multi-argument memoization,
where each argument maps to a "layer" of the recursive map:

```typescript
const memo = new RecursiveMap(/* key length */ 3);

function expensive(a: object, b: string, c: number): string {
  const value = memo.get([a, b, c]);
  if (value) return value;
  const value2 = compute(a, b, c);
  memo.set([a, b, c], compute(a, b, c));
  return value2;
}
```

Explore if we can make `Map` play the same role as object/interface types in typescript, which is to
say, different types per key in the map.

```typescript
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

// the RecordMap type (along with depth) determines what key paths can be set
// to what values.
const recordMap = new KeyConstrainedMap<RecordMap, 2>(/* key length */ 2);

// ok:
recordMap.set(["cow", "petName1"], { isCow: true });

// error: { isCow: true} is not block
recordMap.set(["block", "randomid"], { isCow: true });
```
