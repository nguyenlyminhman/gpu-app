'use client';

import { useEffect, useRef } from "react";

export default function Home() {
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
                    @vertex
                    fn vs_main(@builtin(vertex_index) VertexIndex : u32)  -> @builtin(position) vec4f {
                        var pos = array<vec2f, 3>(
                            vec2f( 0.0,  0.5),   // top
                            vec2f(-0.5, -0.5),   // bottom left
                            vec2f( 0.5, -0.5),   // bottom right
                        );

                        return vec4f(pos[VertexIndex], 0.0, 1.0);
                    }

                    @fragment
                    fn fs_main() -> @location(0) vec4f {
                        return vec4f(1.0, 0.0, 0.0, 1.0); // red color
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
