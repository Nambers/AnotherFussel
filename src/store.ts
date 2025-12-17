import { persistentBoolean } from "@nanostores/persistent";
import { atom } from "nanostores";

export const theme = persistentBoolean("theme"); // false for light, true for dark

export const isZoomed = atom(false);