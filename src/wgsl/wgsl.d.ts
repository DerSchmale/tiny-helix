// Type declarations for importing WGSL shader files in TypeScript
// Allows statements like: import code from './shader.wgsl';

declare module "*.wgsl" {
    const content: string;
    export default content;
}