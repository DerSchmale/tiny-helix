@group(0) @binding(0) var source_tex: texture_2d<f32>;
@group(0) @binding(1) var bilinear_sampler: sampler;

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

@vertex
fn vs_main(@builtin(vertex_index) i: u32) -> VertexOutput {
    var output: VertexOutput;

    // Full-screen triangle
    let x = f32((i << 1u) & 2u);
    let y = f32(i & 2u);

    output.position = vec4f(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
    output.uv = vec2f(x, y);

    return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    return textureSample(source_tex, bilinear_sampler, input.uv);
}

