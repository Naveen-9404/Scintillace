/**
 * ============================================================
 * Event Categories
 * ============================================================
 *
 * Compatibility export for modules that import
 * eventCategories.js.
 *
 * The authoritative category definitions are maintained in:
 *
 * src/constants/event.constants.js
 * ============================================================
 */

import {
  EVENT_CATEGORIES,
} from "./event.constants.js";

const EVENT_CATEGORIES_LIST =
  Object.freeze({
    TECHNICAL:
      EVENT_CATEGORIES.TECHNICAL,

    CULTURAL:
      EVENT_CATEGORIES.CULTURAL,

    SPORTS:
      EVENT_CATEGORIES.SPORTS,

    LITERARY:
      EVENT_CATEGORIES.LITERARY,

    WORKSHOP:
      EVENT_CATEGORIES.WORKSHOP,

    SEMINAR:
      EVENT_CATEGORIES.SEMINAR,

    GAMING:
      EVENT_CATEGORIES.GAMING,

    OTHER:
      EVENT_CATEGORIES.OTHER,
  });

export default EVENT_CATEGORIES_LIST;