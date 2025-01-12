import { Spotlight } from "@/components/ui/spotlight";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { SparklesCore } from "@/components/ui/sparkles";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Editor from "@/components/editor";
import KnowledgeGraph from "@/components/knowledge-graph";
import LearningPaths from "@/components/learning-paths";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden bg-gray-900">
      <BackgroundBeams className="opacity-10" />
      <Spotlight className="hidden md:block" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <TracingBeam className="px-6">
          <div className="max-w-5xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-500">
              NOETHER
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={100}
                className="w-full h-full absolute top-0 left-0 -z-10"
                particleColor="#FFFFFF"
              />
            </h1>
            <p className="text-neutral-400 text-center mt-4 text-lg md:text-xl max-w-2xl mx-auto">
              An AI-powered code editor and learning system that helps you understand and visualize code relationships through dynamic knowledge graphs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-neutral-200">Code Editor</h2>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <Editor />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-neutral-200">Knowledge Graph</h2>
              <div className="h-[500px] rounded-lg overflow-hidden">
                <KnowledgeGraph />
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 text-neutral-200">Learning Paths</h2>
            <div className="h-[300px] rounded-lg overflow-hidden">
              <LearningPaths />
            </div>
          </div>
        </TracingBeam>
      </div>
    </main>
  );
} 