import { AltSceneNode } from "../../altNodes/altMixins";
import { pxToLayoutSize } from "../conversionTables";
import { nodeWidthHeight } from "../../common/nodeWidthHeight";

export const tailwindSize = (node: AltSceneNode): string => {
  return tailwindSizePartial(node).join("");
};

export const tailwindSizePartial = (node: AltSceneNode): [string, string] => {
  const size = nodeWidthHeight(node, true);

  let w = "";
  if (typeof size.width === "number") {
    w += `w-${pxToLayoutSize(size.width)} `;
  } else if (typeof size.width === "string") {
    w += `w-${size.width} `;
  }

  let h = "";
  // console.log("sizeResults is ", sizeResult, node);

  if (typeof size.height === "number") {
    h = `h-${pxToLayoutSize(size.height)} `;
  } else if (typeof size.height === "string") {
    w += `h-${size.height} `;
  }

  return [w, h];
};
