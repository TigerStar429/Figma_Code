import { pxToLayoutSize } from "./conversion_tables";
import { CustomNodeMap, AffectedByCustomAutoLayout } from "./custom_node";

const paddingFromCenter = (node: SceneNode): string => {
  if (node.parent && "width" in node.parent) {
    let comp = "";

    const nodeCenteredPosX = node.x + node.width / 2;

    // if parent is Frame, X should be 0.
    const parentCenteredPosX =
      ("layoutMode" in node.parent ? 0 : node.parent.x) + node.parent.width / 2;

    const marginX = nodeCenteredPosX - parentCenteredPosX;

    if (marginX > 0) {
      comp += `ml-${pxToLayoutSize(marginX)} `;
    } else if (marginX < 0) {
      // abs is necessary because [pxToLayoutSize] only receives a positive number
      comp += `mr-${pxToLayoutSize(Math.abs(marginX))} `;
    }

    const nodeCenteredPosY = node.y + node.height / 2;

    // if parent is Frame, X should be 0.
    const parentCenteredPosY =
      ("layoutMode" in node.parent ? 0 : node.parent.y) +
      node.parent.height / 2;

    const marginY = nodeCenteredPosY - parentCenteredPosY;
    if (marginY > 0) {
      comp += `mt-${pxToLayoutSize(marginY)} `;
    } else if (marginY < 0) {
      // abs is necessary because [pxToLayoutSize] only receives a positive number
      comp += `mb-${pxToLayoutSize(Math.abs(marginY))} `;
    }

    return comp;
  }
  return "";
};

const flexSelfFromCenter = (
  node: SceneNode,
  parentNode: LayoutMixin | undefined,
  layoutDirection: "sd-y" | "sd-x" | "false"
): string => {
  if (!parentNode) {
    return "";
  }

  if (parentNode && "width" in parentNode) {
    let comp = "";

    console.log(
      "correctLayout ",
      layoutDirection,
      " name: ",
      // parentNode?.name,
      " - ",
      node.name
    );

    if (layoutDirection === "sd-y") {
      const nodeCenteredPosX = node.x + node.width / 2;

      // if parent is Frame, X should be 0.
      const parentCenteredPosX =
        ("layoutMode" in parentNode ? 0 : parentNode.x) + parentNode.width / 2;

      const marginX = nodeCenteredPosX - parentCenteredPosX;

      // allow a small threshold
      if (marginX > 4) {
        comp += `self-end `;
      } else if (marginX < -4) {
        // abs is necessary because [pxToLayoutSize] only receives a positive number
        comp += `self-start `;
      }
    } else {
      const nodeCenteredPosY = node.y + node.height / 2;

      // if parent is Frame, X should be 0.
      const parentCenteredPosY =
        ("layoutMode" in parentNode ? 0 : parentNode.y) + parentNode.height / 2;

      const marginY = nodeCenteredPosY - parentCenteredPosY;

      // allow a small threshold
      if (marginY > 4) {
        comp += `self-start `;
      } else if (marginY < -4) {
        // abs is necessary because [pxToLayoutSize] only receives a positive number
        comp += `self-end `;
      }
    }

    return comp;
  }
  return "";
};

// function tailwindMargin(node: SceneNode): string {
//   const padding = findMargin(node);
//   if (padding === undefined) {
//     return "";
//   }

//   const { top, left, right, bottom } = padding;

//   if (top === bottom && top === left && top === right) {
//     return `m-${pxToLayoutSize(top)} `;
//   }

//   // is there a less verbose way of writing this?
//   let comp = "";

//   if (top === bottom && right === left) {
//     return `mx-${pxToLayoutSize(left)} py-${pxToLayoutSize(top)} `;
//   }

//   // py
//   if (top === bottom) {
//     comp += `my-${pxToLayoutSize(top)} `;
//     if (left > 0) {
//       comp += `ml-${pxToLayoutSize(left)} `;
//     }
//     if (right > 0) {
//       comp += `mr-${pxToLayoutSize(right)} `;
//     }

//     return comp;
//   }

//   // px
//   if (left === right) {
//     comp += `mx-${pxToLayoutSize(left)} `;
//     if (top > 0) {
//       comp += `mt-${pxToLayoutSize(top)} `;
//     }
//     if (bottom > 0) {
//       comp += `mb-${pxToLayoutSize(bottom)} `;
//     }
//     return comp;
//   }

//   // independent
//   if (top > 0) {
//     comp += `mt-${pxToLayoutSize(top)} `;
//   }
//   if (bottom > 0) {
//     comp += `mb-${pxToLayoutSize(bottom)} `;
//   }
//   if (left > 0) {
//     comp += `ml-${pxToLayoutSize(left)} `;
//   }
//   if (right > 0) {
//     comp += `mr-${pxToLayoutSize(right)} `;
//   }

//   return comp;
// }

// function findMargin(
//   node: SceneNode
// ):
//   | undefined
//   | {
//       top: number;
//       left: number;
//       right: number;
//       bottom: number;
//     } {
//   if (!node.parent || !("width" in node.parent)) {
//     return undefined;
//   }

//   const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
//   const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

//   if (CustomNodeMap[node.id].customAutoLayoutDirection === "sd-y") {
//     const left = node.x - parentX;
//     const right = node.parent.width - (node.width + node.x - parentX);
//     return { top: 0, left: left, right: right, bottom: 0 };
//   }

//   if (CustomNodeMap[node.id].customAutoLayoutDirection === "sd-x") {
//     const top = node.y - parentY;
//     const bottom = node.parent.height - (node.height + node.y - parentY);
//     return { top: top, left: 0, right: 0, bottom: bottom };
//   }

//   return undefined;
// }

export const retrieveContainerPosition = (
  node: SceneNode,
  parentId: string
): string => {
  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (node.parent === null || parentId === node.parent.id) {
    return "";
  }

  // if node is a Group and has only one child, ignore it; child will set the size
  if (
    "children" in node &&
    node.children.length === 1 &&
    node.width === node.children[0].width &&
    node.height === node.children[0].height
  ) {
    return "";
  }

  // // if parent is a Group and has only one child, ignore it; child will set the size
  // if (
  //   "width" in node.parent &&
  //   node.parent.children.length === 1 &&
  //   node.parent.width === node.width &&
  //   node.parent.height === node.height
  // ) {
  //   return "";
  // }

  let correctParent;
  if (AffectedByCustomAutoLayout[node.id] === "child") {
    correctParent = CustomNodeMap[node.parent.id].largestNode;
  } else if (AffectedByCustomAutoLayout[node.id] === "changed") {
    correctParent = node.parent.parent;
  } else {
    correctParent = node.parent;
  }

  if (
    correctParent &&
    "width" in correctParent &&
    correctParent.width === node.width &&
    correctParent.height === node.height
  ) {
    // if parent and node are same size
    // but what if it needs to center the child?
    return "";
  }

  // Start FlexPos
  // Detect if parent is a CustomAutoLayout. If it is, need to set the child pos relative to it
  let flexPos = "";

  if (
    correctParent &&
    "width" in correctParent &&
    CustomNodeMap[correctParent.id]?.isCustomAutoLayout
  ) {
    const direction = CustomNodeMap[correctParent.id].customAutoLayoutDirection;
    // when in AutoAutoLayout, it is inside a Flex, therefore the position doesn't matter
    flexPos = flexSelfFromCenter(node, correctParent, direction);
  }

  // if it was changed, try to change
  if (AffectedByCustomAutoLayout[node.id] === "changed") {
    const customPadding = paddingFromCenter(node);
    return `${customPadding}${flexPos} `;
  }
  if (flexPos) {
    return flexPos;
  }

  // if correctParent is an AutoLayout, get the correct self position
  if (
    correctParent &&
    CustomNodeMap[correctParent.id] &&
    CustomNodeMap[correctParent?.id ?? ""]?.isCustomAutoLayout
  ) {
    // if node is a child, parent is flex, find position
    // if parent is in CustomNodeMap, parent is flex, find position
    const direction = CustomNodeMap[correctParent.id].customAutoLayoutDirection;

    // @ts-ignore already checked before
    return flexSelfFromCenter(node, correctParent, direction);
  }
  // END FlexPos

  // if this is the parent from the rect modification, add custom Padding and Flex
  if (AffectedByCustomAutoLayout[node.id] === "parent") {
    let margin = "";
    if (node.parent.children.length === 1) {
      margin = paddingFromCenter(node);
    }
    // center child
    return `inline-flex items-center justify-center ${margin}`;
  }

  if (
    CustomNodeMap[node.parent.id] &&
    CustomNodeMap[node.parent.id].orderedChildren.length > 0 &&
    CustomNodeMap[node.parent.id].customAutoLayoutDirection === "false"
  ) {
    // this will be triggered in Group with Text and Empty Rectangle case
    return "";
  }

  if (AffectedByCustomAutoLayout[node.id]) {
    // if node was a Rect and now is a Frame containing other items
    // or if node is a child of that rect
    return "";
  }

  if (AffectedByCustomAutoLayout[node.parent.id]) {
    // todo first thing tomorrow
    return "";
  }

  if (
    node.parent.type === "GROUP" ||
    ("layoutMode" in node.parent &&
      node.parent.layoutMode === "NONE" &&
      node.parent.children.length > 1) ||
    ("children" in node &&
      "width" in node.parent &&
      node.children.every((d) => d.type === "VECTOR"))
  ) {
    // when parent is GROUP or FRAME, try to position the node in it
    // check if view is in a stack. Group and Frames must have more than 1 element
    // [--x--][-width-][--x--]
    // that's how the formula below works, to see if view is centered

    // this is needed for Groups, where node.x is not relative to zero. This is ignored for Frame.
    // todo transform these into a helper function
    const parentX = "layoutMode" in node.parent ? 0 : node.parent.x;
    const parentY = "layoutMode" in node.parent ? 0 : node.parent.y;

    // < 4 is a threshold. If === is used, there can be rounding errors (28.002 !== 28)
    const centerX =
      Math.abs(2 * (node.x - parentX) + node.width - node.parent.width) < 4;
    const centerY =
      Math.abs(2 * (node.y - parentY) + node.height - node.parent.height) < 4;

    // if (centerY) {
    //   // this was the only I could manage to center a div with absolute
    //   // https://stackoverflow.com/a/59807846

    //   // frame don't need to be centered
    //   return "h-full flex items-center ";
    // }

    if (centerX && centerY) {
      const size = node.type === "TEXT" ? "w-full h-full " : "";
      return `${size}m-auto `;
    }
    // else if (centerX) {
    //   if (node.y === 0) {
    //     // y = top, x = center
    //     return "mt-0 mb-auto mx-auto ";
    //   } else if (node.y === node.parent.height) {
    //     // y = bottom, x = center
    //     return "mt-auto mb-0 mx-auto ";
    //   }
    //   // y = any, x = center
    //   // there is no Alignment for this, therefore it goes to manual mode.
    //   // since we are using return, manual mode will be calculated at the end
    // } else if (centerY) {
    //   if (node.x === 0) {
    //     // y = center, x = left
    //     return "my-auto ml-0 mr-auto ";
    //   } else if (node.x === node.parent.width) {
    //     // y = center, x = right
    //     return "my-auto ml-auto mr-0 ";
    //   }
    //   // y = center, x = any
    //   // there is no Alignment for this, therefore it goes to manual mode.
    // }

    // set the width to max if the view is near the corner
    // that will be complemented with margins from [retrieveContainerPosition]
    if (node.parent.type === "GROUP" || "layoutMode" in node.parent) {
      const sizeConverter = (attr: string, num: number): string => {
        const result = pxToLayoutSize(num);
        if (+result > 0) {
          return `${attr}-${result} `;
        }
        return "";
      };

      // when inside autoAutoLayout, mx will be useless (self-align will determine this)
      // todo calculate the margin together with spacing, so that items can be individually offseted

      // let prop = "";
      // this is necessary because Group uses relative position, while Frame is absolute
      // const parentX = parent.type === "GROUP" ? parent.x : 0;
      // const parentY = parent.type === "GROUP" ? parent.y : 0;

      //   const autoAutoLayout = isInsideAutoAutoLayout(parent);
      //   if (autoAutoLayout[0] === "sd-y" || "layoutMode" in node) {
      //     // centerX threshold
      //     // width - (40 - 0) * 2 + nodeWidth is zero when centered

      //     const mx = parent.width - ((node.x - parentX) * 2 + node.width);
      //     if (mx < 4 && mx > -4) {
      //       prop += sizeConverter("mx", node.x - parentX);
      //     } else {
      //       if (node.x - parentX > 0 && node.x - parentX < magicMargin) {
      //         prop += sizeConverter("ml", node.x - parentX);
      //       }
      //       if (parent.width - (node.x - parentX + node.width) < magicMargin) {
      //         prop += sizeConverter("mr", parent.width - node.x - node.width);
      //       }
      //     }
      //   }

      //   if (autoAutoLayout[0] === "sd-x" || "layoutMode" in node) {
      //     autoAutoLayout[1];

      //     // centerY threshold
      //     const my = parent.height - ((node.y - parentY) * 2 + node.height);
      //     if (my < 4 && my > -4) {
      //       prop += sizeConverter("my", node.y - parentY);
      //     } else {
      //       const mt = node.y - parentY;
      //       if (mt > 0 && mt < magicMargin) {
      //         prop += sizeConverter("mt", node.y - parentY);
      //       }
      //       const mb = parent.height - (node.y - parentY + node.height);
      //       if (mb < magicMargin) {
      //         prop += sizeConverter("mb", mb);
      //       }
      //     }
      //   }
      //   if (prop) {
      //     return prop;
      //   }
      //   // when inside an autoAutoLayout, there is no need to get the absolute position
      //   return "";
      // }
    }

    // manual mode, just use the position.
    return "";
  }

  return "";
};

export const wrapTextAutoResize = (node: TextNode, child: string): string => {
  if (node.textAutoResize === "NONE") {
    // = instead of += because we want to replace it
    return `
        SizedBox(
          width: ${node.width},
          height: ${node.height},
          child: ${child}
        ),
        `;
  } else if (node.textAutoResize === "HEIGHT") {
    // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
    // = instead of += because we want to replace it
    return `
        SizedBox(
          width: ${node.width},
          child: ${child}
        ),
        `;
  }

  return child;
};

export const wrapTextInsideAlign = (node: TextNode, child: string): string => {
  let alignment;
  if (node.layoutAlign === "CENTER") {
    if (node.textAlignHorizontal === "LEFT") alignment = "centerLeft";
    if (node.textAlignHorizontal === "RIGHT") alignment = "centerRight";
    if (node.textAlignHorizontal === "CENTER") alignment = "center";
    // no support for justified yet
  } else if (node.layoutAlign === "MAX") {
    if (node.textAlignHorizontal === "LEFT") alignment = "leftBottom";
    if (node.textAlignHorizontal === "RIGHT") alignment = "rightBottom";
    if (node.textAlignHorizontal === "CENTER") alignment = "centerBottom";
  }
  // [node.layoutAlign === "MIN"] is the default, so no need to specify it.
  if (!alignment) alignment = "center";

  // there are many ways to align a text
  if (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE") {
    alignment = "bottomCenter";
  }

  if (
    node.layoutAlign !== "MIN" ||
    (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE")
  ) {
    return `
      Align(
        alignment: Alignment.${alignment},
        child: ${child}
      ),`;
  }
  return child;
};
