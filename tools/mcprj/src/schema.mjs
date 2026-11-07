// Checks a build spec against spec.schema.json. Covers only the keywords that
// schema uses, so the tool keeps no dependencies.
import { readFileSync } from "node:fs";

export const SCHEMA = JSON.parse(readFileSync(new URL("../spec.schema.json", import.meta.url), "utf8"));

const TYPES = {
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
  array: Array.isArray,
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number" && Number.isFinite(v),
  integer: Number.isInteger,
  boolean: (v) => typeof v === "boolean",
};

/** -> a list of problems, each "path: what is wrong"; empty when the spec is valid */
export function validate(value, schema = SCHEMA, path = "spec") {
  if (schema.$ref) {
    const target = schema.$ref
      .replace("#/", "")
      .split("/")
      .reduce((s, k) => s[k], SCHEMA);
    return validate(value, target, path);
  }
  const say = (what) => [`${path}: ${what}`];
  if (schema.type && !TYPES[schema.type](value))
    return say(`should be ${schema.type === "integer" ? "a whole number" : `a ${schema.type}`}`);
  if ("const" in schema && value !== schema.const) return say(`should be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value))
    return say(`${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (schema.oneOf) {
    const fits = schema.oneOf.filter((s) => validate(value, s, path).length === 0).length;
    if (fits !== 1)
      return say(`${JSON.stringify(value)} is not valid here${schema.description ? ` (${schema.description})` : ""}`);
  }
  if (typeof value === "string" && schema.pattern && !new RegExp(schema.pattern).test(value))
    return say(
      `${JSON.stringify(value)} doesn't fit${schema.description ? `: ${schema.description}` : ` ${schema.pattern}`}`
    );
  if (typeof value === "number") {
    if (schema.minimum != null && value < schema.minimum) return say(`${value} is below ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) return say(`${value} is above ${schema.maximum}`);
  }
  const problems = [];
  if (Array.isArray(value)) {
    if (schema.uniqueItems && new Set(value).size !== value.length) problems.push(...say("has repeats"));
    if (schema.items) value.forEach((v, i) => problems.push(...validate(v, schema.items, `${path}[${i}]`)));
  }
  if (TYPES.object(value)) {
    for (const [k, v] of Object.entries(value)) {
      const at = `${path}.${k}`;
      if (schema.propertyNames) {
        const bad = validate(k, schema.propertyNames, at);
        if (bad.length) {
          problems.push(`${at}: the name ${bad[0].slice(at.length + 2)}`);
          continue;
        }
      }
      if (schema.properties?.[k]) problems.push(...validate(v, schema.properties[k], at));
      else if (schema.additionalProperties === false)
        problems.push(`${at}: unknown field; known: ${Object.keys(schema.properties ?? {}).join(", ")}`);
      else if (TYPES.object(schema.additionalProperties))
        problems.push(...validate(v, schema.additionalProperties, at));
    }
  }
  return problems;
}
