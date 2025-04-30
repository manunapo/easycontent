import PhotoEditor from "@/components/PhotoEditor/photo-editor";
import { ImageEditorProvider } from "@/contexts/ImageEditorContext";

export default function Home() {
  return (
    <div className="flex flex-col justify-between min-h-screen w-full bg-zinc-100 font-[family-name:var(--font-geist-sans)] text-zinc-900">
      <main className="flex flex-col justify-between h-full w-full">
        <h1 className="flex">Easy Content</h1>
        <ImageEditorProvider>
          <PhotoEditor />
        </ImageEditorProvider>
      </main>
      <footer className="flex w-full bg-white h-10 bottom-0 items-center justify-center gap-4">
        Easy Content
      </footer>
    </div>
  );
}
