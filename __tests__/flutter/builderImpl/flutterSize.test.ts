import { flutterSize } from "../../../src/flutter/builderImpl/flutterSize";
import {
  AltRectangleNode,
  AltFrameNode,
} from "../../../src/altNodes/altMixins";

describe("Flutter Size", () => {
  // @ts-ignore for some reason, need to override this for figma.mixed to work
  global.figma = {
    mixed: undefined,
  };

  it("size for a rectangle", () => {
    const node = new AltRectangleNode();

    node.width = 16;
    node.height = 16;
    expect(flutterSize(node).size).toEqual("width: 16, height: 16, ");

    node.width = 100;
    node.height = 200;
    expect(flutterSize(node).size).toEqual("width: 100, height: 200, ");

    node.width = 300;
    node.height = 300;
    expect(flutterSize(node).size).toEqual("width: 300, height: 300, ");
  });

  it("STRETCH inside AutoLayout", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.layoutAlign = "INHERIT";
    node.primaryAxisSizingMode = "FIXED";
    node.counterAxisSizingMode = "FIXED";
    node.width = 10;
    node.height = 10;

    const child = new AltRectangleNode();
    child.layoutAlign = "STRETCH";
    child.layoutGrow = 1;
    child.width = 10;
    child.height = 10;

    child.parent = node;
    node.children = [child];

    const fSize1 = flutterSize(child);
    expect(fSize1.size).toEqual("height: double.infinity, ");
    expect(fSize1.isExpanded).toEqual(true);

    node.layoutMode = "VERTICAL";

    const fSize2 = flutterSize(child);
    expect(fSize2.size).toEqual("width: double.infinity, ");
    expect(fSize2.isExpanded).toEqual(true);
  });

  it("Fixed size when children are absolute", () => {
    const node = new AltFrameNode();
    node.layoutMode = "NONE";
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(flutterSize(node).size).toEqual("width: 48, height: 48, ");
  });

  it("counterAxisSizingMode is FIXED", () => {
    const node = new AltFrameNode();
    node.counterAxisSizingMode = "FIXED";
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    node.layoutMode = "HORIZONTAL";
    expect(flutterSize(node).size).toEqual("height: 48, ");

    node.layoutMode = "VERTICAL";
    expect(flutterSize(node).size).toEqual("width: 48, ");

    node.layoutMode = "NONE";
    expect(flutterSize(node).size).toEqual("width: 48, height: 48, ");
  });

  it("counterAxisSizingMode is AUTO", () => {
    const node = new AltFrameNode();
    node.layoutMode = "HORIZONTAL";
    node.counterAxisSizingMode = "AUTO";
    node.primaryAxisSizingMode = "AUTO";
    node.x = 0;
    node.y = 0;
    node.width = 48;
    node.height = 48;
    node.children = [new AltRectangleNode(), new AltRectangleNode()];

    expect(flutterSize(node).size).toEqual("");

    // responsive
    const parentNode = new AltFrameNode();
    parentNode.counterAxisSizingMode = "FIXED";
    parentNode.primaryAxisSizingMode = "FIXED";
    parentNode.x = 0;
    parentNode.y = 0;
    parentNode.width = 48;
    parentNode.height = 48;
    parentNode.children = [node];
    node.parent = parentNode;
    expect(flutterSize(node).size).toEqual("");
    expect(flutterSize(parentNode).size).toEqual("width: 48, height: 48, ");
  });

  it("width changes when there are strokes", () => {
    const node = new AltRectangleNode();
    node.x = 0;
    node.y = 0;
    node.width = 8;
    node.height = 8;

    expect(flutterSize(node).size).toEqual("width: 8, height: 8, ");

    node.strokeWeight = 4;
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    node.strokeAlign = "CENTER";
    expect(flutterSize(node).size).toEqual("width: 12, height: 12, ");

    node.strokeAlign = "OUTSIDE";
    expect(flutterSize(node).size).toEqual("width: 16, height: 16, ");
  });

  it("adjust parent if children's size + stroke > parent size", () => {
    const node = new AltRectangleNode();
    node.width = 8;
    node.height = 8;

    node.strokeWeight = 4;
    node.strokeAlign = "OUTSIDE";
    node.strokes = [
      {
        type: "SOLID",
        color: { r: 0.25, g: 0.25, b: 0.25 },
      },
    ];

    const parentNode = new AltFrameNode();
    parentNode.width = 8;
    parentNode.height = 8;
    parentNode.children = [node];
    node.parent = parentNode;

    const fSize1 = flutterSize(parentNode);

    expect(fSize1.size).toEqual("width: 16, height: 16, ");
    expect(fSize1.isExpanded).toEqual(false);

    node.strokeAlign = "CENTER";
    const fSize2 = flutterSize(parentNode);
    expect(fSize2.size).toEqual("width: 12, height: 12, ");
    expect(fSize2.isExpanded).toEqual(false);
  });

  it("full width when width is same to the parent", () => {
    const parentNode = new AltFrameNode();
    parentNode.layoutMode = "NONE";
    parentNode.width = 12;
    parentNode.height = 12;
    parentNode.counterAxisSizingMode = "AUTO";
    parentNode.primaryAxisSizingMode = "AUTO";

    const node = new AltFrameNode();
    node.width = 12;
    node.height = 12;
    node.parent = parentNode;

    parentNode.children = [node];

    expect(flutterSize(parentNode).size).toEqual("width: 12, height: 12, ");
    expect(flutterSize(node).size).toEqual("width: 12, height: 12, ");
  });
});
