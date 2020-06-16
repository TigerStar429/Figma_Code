import { rgbTo6hex } from "./../tailwind/colors";

import { AltSceneNode } from "../common/altMixins";

export const extractFlutterColors = (
  sceneNode: Array<AltSceneNode>
): Array<string> => {
  const selectedChildren = deepFlatten(sceneNode);

  let colorStr: Array<string> = [];

  // collect all fill[0] and stroke[0] SOLID colors
  selectedChildren.forEach((d) => {
    if ("fills" in d) {
      const fills = convertColor(d.fills);
      if (fills) {
        colorStr.push(fills);
      }
    }
    if ("strokes" in d) {
      const strokes = convertColor(d.strokes);
      if (strokes) {
        colorStr.push(strokes);
      }
    }
  });

  // retrieve only unique colors
  // from https://stackoverflow.com/a/18923480/4418073
  let unique: Record<string, boolean> = {};
  let distinct: Array<string> = [];
  colorStr.forEach(function (x) {
    if (!unique[x.hex]) {
      distinct.push(x);
      unique[x.hex] = true;
    }
  });

  return distinct.sort((a, b) => a.localeCompare(b));
};

const convertColor = (
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
): string | undefined => {
  // kind can be text, bg, border...
  // [when testing] fills can be undefined
  if (fills && fills !== figma.mixed && fills.length > 0) {
    let fill = fills[0];
    if (fill.type === "SOLID") {
      return rgbTo6hex(fill.color);
    }
  }

  return undefined;
};

function deepFlatten(arr: Array<AltSceneNode>): Array<AltSceneNode> {
  let result: Array<AltSceneNode> = [];

  arr.forEach((d) => {
    if ("children" in d) {
      result.push(d);
      result = result.concat(deepFlatten(d.children));
    } else {
      result.push(d);
    }
  });

  return result;
}
