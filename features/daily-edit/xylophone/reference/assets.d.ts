declare module '*.glsl?raw' {
  const source: string;
  export default source;
}

declare module '*.glb?url' {
  const url: string;
  export default url;
}

declare module '*.wav?url' {
  const url: string;
  export default url;
}
