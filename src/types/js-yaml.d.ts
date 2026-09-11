// js-yaml ships without type definitions; this is the small part we use.
declare module 'js-yaml' {
  export function load(text: string): unknown;
  const yaml: { load: typeof load };
  export default yaml;
}
