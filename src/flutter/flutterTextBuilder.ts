import { FlutterDefaultBuilder } from "./flutterDefaultBuilder";
import { AltTextNode } from "../altNodes/altMixins";
import { convertFontWeight } from "../tailwind/tailwindTextBuilder";
import { flutterColor } from "./builderImpl/flutterColor";

export class FlutterTextBuilder extends FlutterDefaultBuilder {
  constructor(optChild: string = "") {
    super(optChild);
  }

  reset(): void {
    this.child = "";
  }

  createText(node: AltTextNode): this {
    this.child = makeTextComponent(node);
    return this;
  }

  textAutoSize(node: AltTextNode): this {
    this.child = wrapTextAutoResize(node, this.child);
    return this;
  }

  /**
   */
  // todo bring it back
  // textAlign(node: AltTextNode): this {
  //   // if layoutAlign !== MIN, Text will be wrapped by Align
  //   // if alignHorizontal is LEFT, don't do anything because that is native

  //   // const alignHorizontal = node.textAlignHorizontal.toString().toLowerCase();

  //   // if (
  //   //   node.textAlignHorizontal !== "LEFT"
  //   // ) {
  //   //   this.attributes += `text-${alignHorizontal} `;
  //   // }

  //   return this;
  // }

  textInAlign(node: AltTextNode): this {
    // this.child = wrapTextInsideAlign(node, this.child);
    return this;
  }
}

export const makeTextComponent = (node: AltTextNode): string => {
  // only undefined in testing
  let alignHorizontal =
    node.textAlignHorizontal?.toString()?.toLowerCase() ?? "left";
  alignHorizontal =
    alignHorizontal === "justified" ? "justify" : alignHorizontal;

  // todo if layoutAlign !== MIN, Text will be wrapped by Align
  // if alignHorizontal is LEFT, don't do anything because that is native
  const textAlign =
    alignHorizontal !== "left"
      ? `textAlign: TextAlign.${alignHorizontal}, `
      : "";

  let text = node.characters;
  if (node.textCase === "LOWER") {
    text = text.toLowerCase();
  } else if (node.textCase === "UPPER") {
    text = text.toUpperCase();
  }
  // else if (node.textCase === "TITLE") {
  // TODO this
  // }

  const textStyle = getTextStyle(node);

  const style = textStyle ? `style: TextStyle(${textStyle}), ` : "";

  return `Text("${text}", ${textAlign}${style}), `;
};

export const getTextStyle = (node: AltTextNode): string => {
  // example: text-md
  let styleBuilder = "";

  styleBuilder += flutterColor(node.fills);

  if (node.fontSize !== figma.mixed) {
    styleBuilder += `fontSize: ${node.fontSize}, `;
  }

  if (node.textDecoration === "UNDERLINE") {
    styleBuilder += "decoration: TextDecoration.underline, ";
  }

  if (
    node.fontName !== figma.mixed &&
    node.fontName.style.toLowerCase().match("italic")
  ) {
    styleBuilder += "fontStyle: FontStyle.italic, ";
  }

  if (node.fontName !== figma.mixed) {
    styleBuilder += `fontFamily: "${node.fontName.family}", `;
  }

  if (node.fontName !== figma.mixed) {
    styleBuilder += `fontWeight: FontWeight.w${convertFontWeight(
      node.fontName.style
    )}, `;
  }

  if (node.letterSpacing !== figma.mixed && node.letterSpacing.value !== 0) {
    if (node.letterSpacing.unit === "PIXELS") {
      styleBuilder += `letterSpacing: ${node.letterSpacing.value}, `;
    } else {
      // node.letterSpacing.unit === "PERCENT"
      // TODO test if end result is satisfatory
      styleBuilder += `letterSpacing: ${node.letterSpacing.value / 10}, `;
    }
  }

  // TODO this calculation is completely wrong
  // if (node.lineHeight !== figma.mixed && node.lineHeight.value !== 0) {
  //   if (node.lineHeight.unit === "PIXELS") {
  //     // TODO test if end result is satisfatory
  //     styleBuilder += `height: ${node.lineHeight.value}, `;
  //   } else if (node.lineHeight.unit === "PERCENT") {
  //     styleBuilder += `height: ${node.lineHeight.value / 100}, `;
  //   }
  // }

  return styleBuilder;
};

export const wrapTextAutoResize = (
  node: AltTextNode,
  child: string
): string => {
  if (node.textAutoResize === "NONE") {
    // = instead of += because we want to replace it
    return `SizedBox(width: ${node.width}, height: ${node.height}, child: ${child}),`;
  } else if (node.textAutoResize === "HEIGHT") {
    // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
    // = instead of += because we want to replace it
    return `SizedBox(width: ${node.width}, child: ${child}),`;
  }

  return child;
};

// export const wrapTextInsideAlign = (
//   node: AltTextNode,
//   child: string
// ): string => {
//   let alignment;
//   if (node.layoutAlign === "CENTER") {
//     if (node.textAlignHorizontal === "LEFT") alignment = "centerLeft";
//     if (node.textAlignHorizontal === "RIGHT") alignment = "centerRight";
//     if (node.textAlignHorizontal === "CENTER") alignment = "center";
//     // no support for justified yet
//   } else if (node.layoutAlign === "MAX") {
//     if (node.textAlignHorizontal === "LEFT") alignment = "leftBottom";
//     if (node.textAlignHorizontal === "RIGHT") alignment = "rightBottom";
//     if (node.textAlignHorizontal === "CENTER") alignment = "centerBottom";
//   }
//   // [node.layoutAlign === "MIN"] is the default, so no need to specify it.
//   if (!alignment) alignment = "center";

//   // there are many ways to align a text
//   if (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE") {
//     alignment = "bottomCenter";
//   }

//   if (
//     node.layoutAlign !== "MIN" ||
//     (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE")
//   ) {
//     return `Align(alignment: Alignment.${alignment}, child: ${child}),`;
//   }
//   return child;
// };
