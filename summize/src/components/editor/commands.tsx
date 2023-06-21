import { InferenceSession } from "@rumbl/laserbeak";
import { Editor, Range, Transforms } from "slate";

export async function runSample(
    session: InferenceSession | null,
    editor: Editor,
    inputText: string,
    selection: Range
) {
    try {
        if (!session || !inputText || inputText.length < 2) {
            return;
        }
        let start_location = selection.focus;
        let prevOutput = "";
        let tokenCount = 0;
        let generation_config = {
            max_length: 512,
            temperature: 1.0,
            top_k: 0.0,
            top_p: 0.0,
            repetition_penalty: 1.0,
        };
        const start = performance.now();
        await session.run(
            inputText,
            (output: string) => {
                tokenCount += 1;
                Transforms.insertText(
                    editor,
                    output.substring(prevOutput.length),
                    {
                        at: {
                            path: start_location.path,
                            offset: start_location.offset + prevOutput.length,
                        },
                    }
                );
                prevOutput = output;
            },
            generation_config
        );
        const duration = performance.now() - start;
        console.log("Inference time:", duration.toFixed(2), "ms");
        console.log("Tok/sec:", (tokenCount / (duration / 1000)).toFixed(2));
    } catch (e: any) {
        console.log(e.toString());
    }
}

const handlePrompt = (
    prompt: string,
    session: InferenceSession | null,
    editor: Editor
) => {
    if (!editor || !editor.selection || !session) {
        return;
    }
    let input_selection = Editor.string(editor, editor.selection);
    let input_text = `${prompt}${input_selection}`;
    Transforms.delete(editor, { at: editor.selection });
    runSample(session, editor, input_text, editor.selection);
};

export const handleSummarize = (
    session: InferenceSession | null,
    editor: Editor
) => {
    if (!editor || !editor.selection) {
        return;
    }
    let input_selection = Editor.string(editor, editor.selection);
    let prompt = `Summarize:\n\n${input_selection}`;
    handlePrompt(prompt, session, editor);
};

export const handleTranslate = (
    lang1: string,
    lang2: string,
    session: InferenceSession | null,
    editor: Editor
) => {
    if (!editor || !editor.selection) {
        return;
    }
    let input_selection = Editor.string(editor, editor.selection);
    let prompt = `Translate to ${lang2}:\n\n${input_selection}`;
    handlePrompt(prompt, session, editor);
};
