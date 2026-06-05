"use client"

import CharacterCount from "@tiptap/extension-character-count"
import Placeholder from "@tiptap/extension-placeholder"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect } from "react"

interface TargetPanelProps {
  initialContent?: string
  onChange: (text: string) => void
}

export default function TargetPanel({ initialContent, onChange }: TargetPanelProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type or paste translation here…" }),
      CharacterCount,
    ],
    content: initialContent ?? "",
    onUpdate({ editor }) {
      onChange(editor.getText())
    },
    editorProps: {
      attributes: {
        class: "min-h-[200px] outline-none text-sm leading-relaxed",
        style: "font-family: 'Noto Sans Ethiopic', 'Noto Sans', sans-serif;",
      },
    },
  })

  useEffect(() => {
    if (editor && initialContent !== undefined && editor.getText() !== initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [editor, initialContent])

  return (
    <div className="flex flex-col h-full">
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
        Target (editable)
      </div>
      <div className="flex-1 bg-white border border-zinc-300 rounded-xl p-4 focus-within:ring-2 focus-within:ring-zinc-900 overflow-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="text-xs text-zinc-400 mt-1 text-right">
        {editor?.storage.characterCount.characters() ?? 0} chars
      </div>
    </div>
  )
}
