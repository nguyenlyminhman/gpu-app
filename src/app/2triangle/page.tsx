'use client';

import { loadShader } from "@/utils/uitls";
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
                alphaMode: "opaque",
            });

            // === Shaders (WGSL) ===
            const shaderCode2Triangle = await loadShader("/shaders/2triangle.wgsl");
            const shaderModule = device.createShaderModule({
                code: shaderCode2Triangle
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

            // === Render frame ===
            function renderFrame() {
                const encoder = device.createCommandEncoder();
                const textureView = context.getCurrentTexture().createView();
                const renderPass = encoder.beginRenderPass({
                    colorAttachments: [{
                        view: textureView,
                        clearValue: { r: 0.647, g: 0.647, b: 0.647, a: 0.8 }, // nền xám
                        loadOp: "clear",
                        storeOp: "store",
                    }],
                });

                renderPass.setPipeline(pipeline);
                renderPass.draw(6, 1, 0, 0); // Vẽ 6 đỉnh
                renderPass.end();

                device.queue.submit([encoder.finish()]);
            }

            // bind pipeline + draw
            renderFrame();
        };

        run();
    }, []);

    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <canvas ref={canvasRef} width={600} height={600}></canvas>
        </div>
    );
}
