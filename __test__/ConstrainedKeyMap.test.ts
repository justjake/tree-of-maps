import { FixedDepthTreeMap, KeyConstrainedMap } from "../RecursiveMap";

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
  block: {
    [key: string]: BlockVal;
  };
  cow: {
    petName1: CowVal;
    petName2: CowVal;
  };
  activity: {
    [key: string]: ActivityVal;
  };
  toad: {
    loveleyToad: CowVal;
    toadyBlock: BlockVal;
  };
};

describe(KeyConstrainedMap, () => {
  let recordMap = new KeyConstrainedMap<RecordMap, 2>(2);
  beforeEach(() => {
    recordMap = new KeyConstrainedMap<RecordMap, 2>(2);
  });

  it("can set each key path", () => {
    const cow: CowVal = { type: "cow" };
    recordMap.set(["cow", "petName1"], cow);

    const block: BlockVal = { type: "block" };
    recordMap.set(["block", "randomid" as string], block);

    // @ts-expect-error Should not be able to set a cow to a block
    recordMap.set(["cow", "petName2"], block);

    // @ts-expect-error Should not be able to set a cow to a block when manually specifying key type
    recordMap.set<["cow", "petName2"], ["block", string]>(
      ["cow", "petName2"],
      block
    );

    expect(recordMap.get(["block", "randomid"])).toBe(block);
    expect(recordMap.get(["cow", "petName1"])).toBe(cow);
  });
});
