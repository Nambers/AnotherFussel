import { persistentBoolean } from "@nanostores/persistent";

export const theme = persistentBoolean("theme"); // false for light, true for dark