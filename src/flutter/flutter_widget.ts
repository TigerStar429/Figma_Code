import {
  rgbTohex,
  convertFontWeight,
  flutterColor,
  mostFrequentString,
} from "./flutter_helpers";

export const makeTextComponent = (node: TextNode): string => {
  let alignHorizontal = node.textAlignHorizontal.toString().toLowerCase();
  alignHorizontal =
    alignHorizontal === "justify" ? "justified" : alignHorizontal;

  // if layoutAlign !== MIN, Text will be wrapped by Align
  // if alignHorizontal is LEFT, don't do anything because that is native
  const textAlign =
    node.layoutAlign === "MIN" && alignHorizontal !== "left"
      ? `textAlign: TextAlign.${alignHorizontal},`
      : ``;

  const fontSize =
    node.fontSize !== figma.mixed ? `fontSize: ${node.fontSize}` : ``;

  const fontFamily =
    node.fontName !== figma.mixed ? `fontFamily: ${node.fontName.family}` : ``;

  const fontWeight =
    node.fontName !== figma.mixed
      ? `fontWeight: FontWeight.w${convertFontWeight(node.fontName.style)}`
      : ``;

  const color = flutterColor(node.fills);

  return `
      Text(
        "${node.characters}",
        ${textAlign}
        style: TextStyle(
          ${fontSize},
          //${fontFamily},
          ${fontWeight},
          ${color}
        ),
      ),`;
};

export const makeRowColumn = (
  node: FrameNode | ComponentNode | InstanceNode,
  children: string
): string => {
  // ROW or COLUMN
  const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "Row" : "Column";
  const mostFrequent = mostFrequentString(
    node.children.map((d) => d.layoutAlign)
  );

  const layoutAlign = mostFrequent === "MIN" ? "start" : "center";
  const crossAxisColumn =
    rowOrColumn === "Column"
      ? `crossAxisAlignment: CrossAxisAlignment.${layoutAlign},`
      : "";
  const mainAxisSize = "mainAxisSize: MainAxisSize.min,";
  return `${rowOrColumn}(${mainAxisSize}${crossAxisColumn}children:[${children}],),`;
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
export const makeContainer = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode,
  child: string
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return child;
  }

  const propBoxDecoration: string = getContainerDecoration(node);

  const propWidthHeight: string = getContainerSizeProp(node);

  if (node.fills !== figma.mixed && node.fills.length > 0) {
    let fill = node.fills[0];

    // todo IMAGE and multiple Gradients
    if (fill.type === "IMAGE") {
    }
  }

  /// CONTAINER
  /// Put everything together
  const propChild: string = child ? `child: ${child}` : ``;

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding: string = ``;
  if (
    node.type === "FRAME" ||
    node.type === "COMPONENT" ||
    node.type === "INSTANCE"
  ) {
    propPadding = getPaddingProp(node);
  }

  if (propWidthHeight || propBoxDecoration) {
    // Container is a container if [propWidthHeight] and [propBoxDecoration] are set.
    return `\nContainer(${propWidthHeight}${propBoxDecoration}${propPadding}${propChild}),`;
  } else if (propPadding) {
    // if there is just a padding, add Padding
    return `\nPadding(${propPadding}${propChild}),`;
  } else {
    return child;
  }
};

const getContainerDecoration = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
): string => {
  /// DECORATION
  /// This is the code that will generate the BoxDecoration for the Container

  // retrieve the fill color, when existent (returns "" otherwise)
  const propBackgroundColor = flutterColor(node.fills);

  // retrieve the stroke color, when existent (returns "" otherwise)
  const propStrokeColor = flutterColor(node.strokes);

  // only add strokeWidth when there is a strokeColor (returns "" otherwise)
  const propStrokeWidth = propStrokeColor ? `width: ${node.strokeWeight},` : ``;

  // modify the circle's shape when type is ellipse
  const propShape = node.type === "ELLIPSE" ? "shape: BoxShape.circle," : "";

  // generate the border, when it should exist
  const propBorder =
    propStrokeColor || propStrokeWidth
      ? `border: Border.all(${propStrokeColor}${propStrokeWidth}),`
      : ``;

  let propBoxShadow = "";
  if (node.effects.length > 0) {
    const drop_shadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    let boxShadow = "";
    if (drop_shadow) {
      drop_shadow.forEach((d: ShadowEffect) => {
        d.radius;
        boxShadow += `BoxShadow(
          color: ${rgbTohex(d.color)},
          blurRadius: ${d.radius},
          offset: Offset(${d.offset.x}, ${d.offset.y}),
        ), `;
      });
    }
    // TODO inner shadow, layer blur
    propBoxShadow = `boxShadow: [ ${boxShadow} ]`;
  }

  // retrieve the borderRadius, when existent (returns "" for EllipseNode)
  const propBorderRadius = getCornerRadiusProp(node);

  // generate the decoration, or just the backgroundColor
  return node.cornerRadius !== 0 || propStrokeColor || propShape
    ? `decoration: BoxDecoration(${propBorderRadius}${propShape}${propBorder}${propBoxShadow}${propBackgroundColor}),`
    : `${propBackgroundColor}`;
};

const getCornerRadiusProp = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
) => {
  if (node.type === "ELLIPSE") return "";

  return node.cornerRadius !== figma.mixed
    ? `borderRadius: BorderRadius.circular(${node.cornerRadius}), `
    : `borderRadius: BorderRadius.only(topLeft: ${node.topLeftRadius}, topRight: ${node.topRightRadius}, bottomLeft: ${node.bottomLeftRadius}, bottomRight: ${node.bottomRightRadius}), `;
};

const getContainerSizeProp = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
) => {
  /// WIDTH AND HEIGHT
  /// Will the width and height be necessary?

  // when the child has the same size as the parent, don't set the size twice
  if (
    node.type === "FRAME" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    if (node.children.length === 1) {
      const child = node.children[0];
      if (child.width === node.width && child.height && node.height) {
        return ``;
      }
    }
  }

  let nodeHeight = node.height;
  let nodeWidth = node.width;

  // Flutter doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if (node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight;
      nodeWidth += node.strokeWeight;
    }
  }

  const propHeight = `height: ${nodeHeight}, `;
  const propWidth = `width: ${nodeWidth}, `;

  if (
    node.type === "FRAME" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.
    if (node.counterAxisSizingMode === "FIXED") {
      // when AutoLayout is HORIZONTAL, width is set by Figma and height is auto.
      if (node.layoutMode === "HORIZONTAL") {
        return propHeight;
      } else if (node.layoutMode === "VERTICAL") {
        // when AutoLayout is VERTICAL, height is set by Figma and width is auto.
        return propWidth;
      }
      return `${propWidth}${propHeight}`;
    }
  } else if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
    return `${propWidth}${propHeight}`;
  }

  return ``;
};

const getPaddingProp = (node: DefaultFrameMixin): string => {
  // Add padding if necessary!
  // This must happen before Stack or after the Positioned, but not before.

  // padding is only valid for auto layout.
  // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
  if (node.layoutMode === "NONE") return ``;

  if (node.horizontalPadding > 0 || node.verticalPadding > 0) {
    const propHorizontalPadding =
      node.horizontalPadding > 0
        ? `horizontal: ${node.horizontalPadding}, `
        : ``;

    const propVerticalPadding =
      node.verticalPadding > 0 ? `vertical: ${node.verticalPadding}, ` : ``;

    return `padding: const EdgeInsets.symmetric(${propVerticalPadding}${propHorizontalPadding}),`;
  }
  return ``;
};
