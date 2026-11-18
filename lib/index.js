/**
 * dsh-mobile-fixes — host half: intentionally does nothing.
 *
 * All the work is CSS injected by ./client.js in the browser. This file exists
 * only because the bundle patch row loads the package main entry as the host
 * half, and a row whose module is missing fails the whole layer.
 */
export const inject = [];
export function apply() {}
