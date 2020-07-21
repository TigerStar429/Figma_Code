import { AltFrameNode } from "../../src/altNodes/altMixins";
import { tailwindMain } from "../../src/tailwind/tailwindMain";
import { AltRectangleNode } from "../../src/altNodes/altMixins";
import { convertToAutoLayout } from "../../src/altNodes/convertToAutoLayout";

describe("Convert to AutoLayout", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("Simple conversion", () => {
    const frame = new AltFrameNode();
    frame.x = 0;
    frame.y = 0;
    frame.width = 50;
    frame.height = 50;
    frame.layoutMode = "NONE";

    const node1 = new AltRectangleNode();
    node1.x = 0;
    node1.y = 0;
    node1.width = 20;
    node1.height = 20;
    node1.parent = frame;
    node1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1.0,
          g: 0.0,
          b: 0.0,
        },
      },
    ];

    const node2 = new AltRectangleNode();
    node2.x = 20;
    node2.y = 0;
    node2.width = 20;
    node2.height = 20;
    node2.parent = frame;
    node2.fills = [
      {
        type: "SOLID",
        color: {
          r: 0.0,
          g: 1.0,
          b: 0.0,
        },
      },
    ];

    // initially they are not ordered. ConvertToAutoLayout will also order them.
    frame.children = [node2, node1];

    // output should be HORIZONTAL
    expect(tailwindMain([convertToAutoLayout(frame)])).toEqual(
      `<div class="inline-flex items-center justify-center pr-2 pb-8 w-12 h-12">
<div class="w-1/2 h-5 self-start bg-red-700"></div>
<div class="w-1/2 h-5 self-start bg-green-600"></div></div>`
    );

    // output should be VERTICAL
    node2.x = 0;
    node2.y = 20;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(tailwindMain([convertToAutoLayout(frame)])).toEqual(
      `<div class="inline-flex flex-col items-center justify-center pr-8 pb-2 w-12">
<div class="w-full h-5 self-start bg-red-700"></div>
<div class="w-full h-5 self-start bg-green-600"></div></div>`
    );

    // horizontally align while vertical
    node1.width = 50;

    node2.x = 25;
    node2.y = 25;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(tailwindMain([convertToAutoLayout(frame)])).toEqual(
      `<div class="inline-flex flex-col space-y-1 items-center justify-center pb-1 w-12">
<div class="w-full h-5 bg-red-700"></div>
<div class="w-5 h-5 self-end bg-green-600"></div></div>`
    );

    // vertically align while horizontal
    node1.width = 20;
    node1.height = 50;

    node2.x = 20;
    node2.y = 20;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(tailwindMain([convertToAutoLayout(frame)])).toEqual(
      `<div class="inline-flex items-center justify-center pr-2 w-12 h-12">
<div class="w-1/2 h-12 bg-red-700"></div>
<div class="w-1/2 h-5 self-end bg-green-600"></div></div>`
    );

    node1.height = 20;

    // output should be NOTHING
    node2.x = 10;
    node2.y = 10;
    frame.layoutMode = "NONE";
    frame.children = [node2, node1];

    expect(tailwindMain([convertToAutoLayout(frame)])).toEqual(
      `<div class="relative" style="width: 50px; height: 50px;">
<div class="w-5 h-5 absolute bg-green-600" style="left: 10px; top: 10px;"></div>
<div class="w-5 h-5 absolute left-0 top-0 bg-red-700"></div></div>`
    );
  });
});
