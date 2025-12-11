import React, { useState, useEffect, useRef } from 'react';
import { useImageProcessor } from '../hooks/useImageProcessor';
import { perfMonitor } from '../lib/renderOptimization';

export const PerformanceTest: React.FC = () => {
    const { processImageFile, algorithm, setAlgorithm, isProcessing } = useImageProcessor();
    const [logs, setLogs] = useState<string[]>([]);
    const [running, setRunning] = useState(false);

    // Helper to log
    const log = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].slice(0, -1)} - ${msg}`]);

    // Generate a test image
    const createTestImage = async (size: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Draw random noise
        const imageData = ctx.createImageData(size, size);
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = Math.random() * 255;
            imageData.data[i + 1] = Math.random() * 255;
            imageData.data[i + 2] = Math.random() * 255;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        return new Promise<File>((resolve) => {
            canvas.toBlob((blob) => {
                resolve(new File([blob!], "test_noise.png", { type: "image/png" }));
            });
        });
    };

    const runBenchmark = async () => {
        setRunning(true);
        setLogs([]);
        log("Starting benchmark...");

        try {
            const size = 2000; // 2000x2000 image
            log(`Generating ${size}x${size} test image...`);
            const file = await createTestImage(size);
            if (!file) throw new Error("Failed to create image");

            log("Image created. Starting processing pipeline...");

            const start = performance.now();
            await processImageFile(file);
            const end = performance.now();

            log(`Total Pipeline Time: ${(end - start).toFixed(2)}ms`);

        } catch (e) {
            log(`Error: ${e}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-10 font-mono text-sm text-white">
            <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full border border-gray-700">
                <h2 className="text-xl mb-4 font-bold text-blue-400">Performance Benchmark</h2>

                <div className="mb-4 space-x-4">
                    <button
                        onClick={runBenchmark}
                        disabled={running || isProcessing}
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 disabled:opacity-50"
                    >
                        {running ? 'Running...' : 'Run Benchmark'}
                    </button>

                    <button
                        onClick={() => setLogs([])}
                        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    >
                        Clear Logs
                    </button>
                </div>

                <div className="h-64 overflow-y-auto bg-black p-4 rounded border border-gray-800 font-mono text-xs">
                    {logs.map((L, i) => <div key={i}>{L}</div>)}
                    {logs.length === 0 && <div className="text-gray-500 italic">Ready to start...</div>}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    Note: This test generates a synthetic image and feeds it through the `processImageFile` pipeline.
                </div>
            </div>
        </div>
    );
};
