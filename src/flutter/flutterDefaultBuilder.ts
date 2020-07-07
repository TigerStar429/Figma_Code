import { flutterPosition } from "./builderImpl/flutterPosition";
import {
  flutterVisibility,
  flutterOpacity,
  flutterRotation,
} from "./builderImpl/flutterBlend";
import {
  AltSceneNode,
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
} from "../altNodes/altMixins";

import { flutterContainer } from "./flutterContainer";
import { flutterMaterial } from "./flutterMaterial";

export class FlutterDefaultBuilder {
  child: string = "";

  constructor(optChild: string = "") {
    this.child = optChild ?? "";
  }

  reset(): void {
    this.child = "";
  }

  createContainer(
    node: AltRectangleNode | AltEllipseNode | AltFrameNode,
    material: boolean
  ): this {
    if (
      material &&
      node.fills !== figma.mixed &&
      node.fills.length > 0 &&
      node.fills[0].visible === true
    ) {
      this.child = flutterMaterial(node, this.child);
    } else {
      this.child = flutterContainer(node, this.child);
    }
    return this;
  }

  blendAttr(node: AltSceneNode): this {
    this.child = flutterVisibility(node, this.child);
    this.child = flutterRotation(node, this.child);
    this.child = flutterOpacity(node, this.child);

    return this;
  }

  containerPosition(node: AltSceneNode, parentId: string): this {
    this.child = flutterPosition(node, this.child, parentId);
    return this;
  }
}
