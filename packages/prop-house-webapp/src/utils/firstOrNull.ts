import nthOrNull from "./nthOrNull";

/**
 * Return the first element from a list or null if the list is not long enough
 * @param list list to return from
 * @returns An object of type T or null if the list is shorter than 1 elements
 */
const firstOrNull = <T>(list: T[]): T | null => nthOrNull(0, list);

export default firstOrNull;
