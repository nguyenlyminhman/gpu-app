struct VSOutput {
    @builtin(position) Position: vec4f,
    @location(0) color: vec4f
};

@vertex
fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> VSOutput {
    var pos = array<vec2f, 3>(
        vec2f(0.0, 0.5),   // top
        vec2f(-0.5, -0.5),   // bottom left
        vec2f(0.5, -0.5),   // bottom right
    );

    var colors = array<vec4f, 1>(
        vec4f(1.0, 0.0, 1.0, 1.0),
    );

    var output: VSOutput;
    output.Position = vec4f(pos[VertexIndex], 0.0, 1.0);
    output.color = colors[VertexIndex];
    return output;
}

@fragment
fn fs_main(in: VSOutput) -> @location(0) vec4f {
    return in.color;
}
