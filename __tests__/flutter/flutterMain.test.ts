import { flutterMain } from "../../src/flutter/flutterMain";
import { convertToAutoLayout } from "../../src/altNodes/convertToAutoLayout";
import {
  AltRectangleNode,
  AltFrameNode,
  AltGroupNode,
} from "../../src/altNodes/altMixins";

describe("Flutter Main", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };
  it("Standard flow", () => {
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

    expect(flutterMain([convertToAutoLayout(node)], "", false))
      .toEqual(`Container(width: 32, height: 32, child: Stack(children:[Positioned(left: 9, top: 9, child: 
Container(width: 4, height: 4, color: Color(0xffffffff), ),),Positioned(left: 9, top: 9, child: 
Container(width: 4, height: 4, ),),],),)`);
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

    // this works as a test for JSX, but should never happen in reality. In reality Frame would need to have 2 children and be relative.
    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(flutterMain([convertToAutoLayout(node)]))
      .toEqual(`Container(width: 320, child: Stack(children:[Positioned(left: 9, top: 9, child: 
Container(width: 257, height: 8, color: Color(0xffffffff), ),),Positioned(left: 9, top: 9, child: 
Container(width: 8, height: 257, ),),],),)`);
  });

  it("Group with relative position", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltGroupNode();
    node.width = 32;
    node.height = 32;
    node.x = 0;
    node.y = 0;
    node.name = "GROUP";
    node.isRelative = true;

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
    expect(flutterMain([node]))
      .toEqual(`Stack(children:[Positioned(left: 9, top: 9, child: 
Container(width: 4, height: 4, color: Color(0xffffffff), ),),],)`);
  });

  it("Row and Column with 2 children", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltFrameNode();
    node.width = 32;
    node.height = 8;
    node.x = 0;
    node.y = 0;
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "AUTO";
    node.itemSpacing = 8;

    const child1 = new AltRectangleNode();
    child1.width = 8;
    child1.height = 8;
    child1.x = 0;
    child1.y = 0;
    child1.layoutAlign = "MAX";
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
    child2.height = 8;
    child2.x = 16;
    child2.y = 0;
    child2.layoutAlign = "MAX";
    child2.fills = [
      {
        type: "SOLID",
        color: {
          r: 0,
          g: 0,
          b: 0,
        },
      },
    ];

    node.children = [child1, child2];
    child1.parent = node;
    child2.parent = node;

    expect(flutterMain([node]))
      .toEqual(`Row(mainAxisSize: MainAxisSize.min, children:[
Container(width: 8, height: 8, color: Color(0xffffffff), ), SizedBox(width: 8),
Container(width: 8, height: 8, color: Color(0xff000000), ),], ),`);

    // variations for test coverage
    node.layoutMode = "VERTICAL";
    child1.layoutAlign = "MIN";
    child2.layoutAlign = "MIN";

    expect(flutterMain([node]))
      .toEqual(`Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children:[
Container(width: 8, height: 8, color: Color(0xffffffff), ), SizedBox(height: 8),
Container(width: 8, height: 8, color: Color(0xff000000), ),], ),`);
  });

  it("Row with 1 children", () => {
    // this also should neve happen in reality, because Group must have the same size as the children.

    const node = new AltFrameNode();
    node.width = 32;
    node.height = 8;
    node.x = 0;
    node.y = 0;
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "AUTO";
    node.itemSpacing = 8;

    const child1 = new AltRectangleNode();
    child1.width = 8;
    child1.height = 8;
    child1.x = 0;
    child1.y = 0;
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

    node.children = [child1];
    child1.parent = node;

    expect(flutterMain([node], "", true)).toEqual(
      `SizedBox(width: 8, height: 8, child: 
Material(color: Color(0xffffffff), ), ),`
    );
  });
});
