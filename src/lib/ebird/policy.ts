import type { Policy } from "./read";

/*
 * How each place in the eBird export is shown. Unlisted places are shown as
 * their county, and as a cell on the map: the real point never leaves the
 * build unless it is listed here as `exact`. Mal edits this file.
 *
 * Find a Location ID in the export's "Location ID" column.
 */
export const policy: Policy = {
  // 0.1 degrees: about 11 km north to south.
  cell: 0.1,
  places: {
    // L00000000: { label: "A public park", exact: true },
    // L00000001: { hide: true },
  },
};
