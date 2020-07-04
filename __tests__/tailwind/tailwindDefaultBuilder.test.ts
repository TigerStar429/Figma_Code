import { convertToAutoLayout } from "./../../src/altNodes/convertToAutoLayout";
import {
  AltRectangleNode,
  AltFrameNode,
  AltGroupNode,
} from "../../src/altNodes/altMixins";
import { TailwindDefaultBuilder } from "../../src/tailwind/tailwindDefaultBuilder";
import { tailwindMain } from "../../src/tailwind/tailwindMain";

describe("Tailwind Default Builder", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("JSX", () => {
    const node = new AltRectangleNode();
    node.name = "RECT";

    const builder = new TailwindDefaultBuilder(true, node, true);

    expect(builder.build()).toEqual(' className="RECT"');

    builder.reset();
    expect(builder.attributes).toEqual("");
  });

  it("JSX with relative position", () => {
    const node = new AltFrameNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "FRAME";
    node.layoutMode = "NONE";
    node.counterAxisSizingMode = "FIXED";

    const child1 = new AltRectangleNode();
    child1.width = 4;
    child1.height = 4;
    child1.x = 9;
    child1.y = 9;
    child1.name = "RECT1";
    child1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    const child2 = new AltRectangleNode();
    child2.width = 4;
    child2.height = 4;
    child2.x = 9;
    child2.y = 9;
    child2.name = "RECT2";

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(tailwindMain([convertToAutoLayout(node)], "", true, true))
      .toEqual(`<div className="FRAME relative" style={{width: 32, height: 32,}}>
<div className="RECT1 absolute w-1 h-1 bg-white" style={{left:9px, top:9px,}}></div>
<div className="RECT2 absolute w-1 h-1" style={{left:9px, top:9px,}}></div></div>`);
  });

  it("children is larger than 256", () => {
    const node = new AltFrameNode();
    node.width = 320;
    node.height = 320;
    node.name = "FRAME";
    node.layoutMode = "NONE";
    node.counterAxisSizingMode = "FIXED";

    const child1 = new AltRectangleNode();
    child1.width = 257;
    child1.height = 8;
    child1.x = 9;
    child1.y = 9;
    child1.name = "RECT1";
    child1.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    const child2 = new AltRectangleNode();
    child2.width = 8;
    child2.height = 257;
    child2.x = 9;
    child2.y = 9;
    child2.name = "RECT2";

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(tailwindMain([convertToAutoLayout(node)]))
      .toEqual(`<div class="relative" style="width: 320px; height: 320px;">
<div class="absolute bg-white" style="left:9px; top:9px; width: 257px; height: 8px;"></div>
<div class="absolute" style="left:9px; top:9px; width: 8px; height: 257px;"></div></div>`);
  });

  it("Group with relative position", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltGroupNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "GROUP";

    const child = new AltRectangleNode();
    child.width = 4;
    child.height = 4;
    child.x = 9;
    child.y = 9;
    child.name = "RECT";
    child.fills = [
      {
        type: "SOLID",
        color: {
          r: 1,
          g: 1,
          b: 1,
        },
      },
    ];

    node.children = [child];
    child.parent = node;
    expect(tailwindMain([node], "", true, true))
      .toEqual(`<div className="GROUP relative w-8 h-8">
<div className="RECT absolute w-1 h-1 bg-white" style={{left:9px, top:9px,}}></div></div>`);
  });
});
