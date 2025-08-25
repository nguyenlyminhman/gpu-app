'use client';

import { useEffect, useRef } from "react";

export default function TwoTriangle() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const run = async () => {
            if (!navigator.gpu) {
                console.error("WebGPU is not supported in this browser.");
                return;
            }

            const canvas = canvasRef.current!;
            const context = canvas.getContext("webgpu")!;

            // Adapter + device
            const adapter = await navigator.gpu.requestAdapter();
            const device = await adapter?.requestDevice();
            if (!device) return;

            // Configure canvas
            const format = navigator.gpu.getPreferredCanvasFormat();
            context.configure({
                device,
                format,
                alphaMode: "premultiplied",
            });

            // === Shaders (WGSL) ===
            const shaderModule = device.createShaderModule({
                code: `
                    struct VSOutput {
                        @builtin(position) Position : vec4f,
                        @location(0) color : vec4f
                    };

                    @vertex
                    fn vs_main(@builtin(vertex_index) VertexIndex : u32) -> VSOutput {
                        var pos = array<vec2f, 6>(
                            // Tam giác 1
                            vec2f( 0.0,  0.5),   
                            vec2f(-0.5, -0.5),   
                            vec2f( 0.5, -0.5),   

                            // Tam giác 2
                            vec2f( 0.0, -0.2),   
                            vec2f(-0.5, -0.8),   
                            vec2f( 0.5, -0.8)    
                        );

                        var colors = array<vec4f, 6>(
                            // Tam giác 1 màu đỏ
                            vec4f(1.0, 0.0, 0.0, 1.0),
                            vec4f(1.0, 0.0, 0.0, 1.0),
                            vec4f(1.0, 0.0, 0.0, 1.0),

                            // Tam giác 2 màu xanh
                            vec4f(0.0, 0.0, 1.0, 1.0),
                            vec4f(0.0, 0.0, 1.0, 1.0),
                            vec4f(0.0, 0.0, 1.0, 1.0)
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
                    `
            });

            // === Pipeline ===
            const pipeline = device.createRenderPipeline({
                layout: "auto",
                vertex: {
                    module: shaderModule,
                    entryPoint: "vs_main",
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: "fs_main",
                    targets: [{ format }],
                },
                primitive: {
                    topology: "triangle-list",
                },
            });

            // === Render pass ===
            const commandEncoder = device.createCommandEncoder();
            const textureView = context.getCurrentTexture().createView();

            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [
                    {
                        view: textureView,
                        clearValue: { r: 0.647, g: 0.647, b: 0.647, a: 0.8 }, // black bg
                        loadOp: "clear",
                        storeOp: "store",
                    },
                ],
            });

            // bind pipeline + draw
            renderPass.setPipeline(pipeline);
            renderPass.draw(6, 1, 0, 0); // draw 3 vertices (1 triangle)
            renderPass.end();

            device.queue.submit([commandEncoder.finish()]);
        };

        run();
    }, []);

    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <canvas ref={canvasRef} width={600} height={600}></canvas>
        </div>
    );
}
