/**
 * Auth-related constants for BruinBazaar.
 * UCLA email validation: @ucla.edu or @g.ucla.edu only (no SSO).
 */

/** Regex for valid UCLA email domains (@ucla.edu or @g.ucla.edu) */
export const UCLA_EMAIL_REGEX = /^[^\s@]+@(ucla\.edu|g\.ucla\.edu)$/;

/** Year options for user profile (PRD) */
export const YEAR_OPTIONS = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate',
];
