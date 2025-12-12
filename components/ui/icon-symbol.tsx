// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolViewProps, SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import type { OpaqueColorValue, StyleProp, TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  gearshape: "settings",
  "arrow.right": "arrow-right",
  "chevron.left": "chevron-left",
  "plus.circle.fill": "add-circle",
  plus: "add",
  xmark: "close",
  magnifyingglass: "search",
  ellipsis: "more-horiz",
  "ellipsis.circle": "more-vert",
  "square.and.arrow.up": "share",
  "square.and.arrow.down": "download",
  "square.and.arrow.up.fill": "upload",
  trash: "delete",
  "trash.fill": "delete",
  pencil: "edit",
  "pencil.circle": "edit",
  "pencil.circle.fill": "edit",
  "doc.text": "description",
  "doc.text.fill": "description",
  "doc.text.image": "image",
  "doc.text.image.fill": "image",
  "doc.on.clipboard": "content-copy",
  "doc.on.clipboard.fill": "content-copy",
  "doc.on.doc": "content-copy",
  "info": "info",
  "info.circle": "info",
  "terminal.fill": "terminal",
  "sparkles.tv.fill": "auto-awesome",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
