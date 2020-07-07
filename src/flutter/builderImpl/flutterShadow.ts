import { AltSceneNode } from "../../altNodes/altMixins";
import { rgbTo8hex } from "../../common/rgbToHex";

export const flutterBoxShadow = (node: AltSceneNode): string => {
  let propBoxShadow = "";
  if (node.effects?.length > 0) {
    const dropShadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );

    if (dropShadow.length > 0) {
      let boxShadow = "";

      dropShadow.forEach((d: ShadowEffect) => {
        const color = `color: Color(0x${rgbTo8hex(d.color)}, `;
        const radius = `blurRadius: ${d.radius}, `;
        const offset = `offset: Offset(${d.offset.x}, ${d.offset.y}), `;
        boxShadow += `BoxShadow(${color}${radius}${offset}),),`;
      });

      propBoxShadow = `boxShadow: [ ${boxShadow} ],`;
    }
    // TODO inner shadow, layer blur
  }
  return propBoxShadow;
};

export const flutterElevationAndShadowColor = (
  node: AltSceneNode
): [string, string] => {
  let elevation = "";
  let shadowColor = "";

  if (node.effects.length > 0) {
    const dropShadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    if (dropShadow.length > 0 && dropShadow[0].type === "DROP_SHADOW") {
      shadowColor = `color: Color(0x${rgbTo8hex(dropShadow[0].color)}), `;
      elevation = `elevation: ${dropShadow[0].radius}, `;
    }
  }

  return [elevation, shadowColor];
};
