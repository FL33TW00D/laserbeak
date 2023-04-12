import React, { useMemo, useRef, useEffect, useState, useContext } from "react";
import { Slate, Editable, withReact, useSlate, useFocused } from "slate-react";
import {
    Editor,
    Transforms,
    Text,
    createEditor,
    Descendant,
    Range,
} from "slate";
import { css } from "@emotion/css";
import { withHistory } from "slate-history";

import { Button, Icon, Menu, Portal } from "./components";
import { useMountEffectOnce } from "../hooks/useMountEffectOnce";
import { ModelManager, AvailableModels } from "laserbeak";

const modelContext = React.createContext<any | null>(null);

const HoveringMenuExample = () => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const [model, setModel] = useState<any | null>(null);

    useMountEffectOnce(() => {
        (async () => {
            let modelManager = new ModelManager();
            await modelManager.init();
            let loadedModel = await modelManager.loadModel(
                AvailableModels.FLAN_T5_BASE
            );
            setModel(loadedModel);
        })();
    });

    return (
        <Slate editor={editor} value={initialValue}>
            <modelContext.Provider value={model}>
                <HoveringToolbar />
                <Editable
                    renderLeaf={(props) => <Leaf {...props} />}
                    placeholder="Enter some text..."
                    onDOMBeforeInput={(event: InputEvent) => {
                        switch (event.inputType) {
                            case "formatBold":
                                event.preventDefault();
                                return toggleFormat(editor, "bold");
                            case "formatItalic":
                                event.preventDefault();
                                return toggleFormat(editor, "italic");
                            case "formatunderline":
                                event.preventDefault();
                                return toggleFormat(editor, "underlined");
                            case "summarize":
                                event.preventDefault();
                                return handleSummarize(model, editor);
                        }
                    }}
                    style={{
                        minWidth: "100%",
                    }}
                />
            </modelContext.Provider>
        </Slate>
    );
};

async function runSample(
    model: any,
    editor: Editor,
    inputText: string,
    selection: Selection
) {
    try {
        if (!model || !inputText || inputText.length < 2) {
            return;
        }
        let start_location = selection.focus;
        const start = performance.now();
        let prevOutput = "";
        await model.run(inputText, (output: string) => {
            Transforms.insertText(editor, output.substring(prevOutput.length), {
                at: {
                    path: start_location.path,
                    offset: start_location.offset + prevOutput.length,
                },
            });
            prevOutput = output;
        });
        const duration = performance.now() - start;
        console.log("Inference time:", duration.toFixed(2), "ms");
    } catch (e: any) {
        console.log(e.toString());
    }
}

const handleSummarize = (model: any, editor: Editor) => {
    console.log("Calling summarize");
    console.log("Selection: ", editor.selection);
    if (!editor.selection) {
        return;
    }
    let input_selection = Editor.string(editor, editor.selection);
    let input_text = `Summarize:\n\n${input_selection}`;
    Transforms.delete(editor, { at: editor.selection });
    runSample(model, editor, input_text, editor.selection);
};

const toggleFormat = (editor: Editor, format) => {
    const isActive = isFormatActive(editor, format);
    Transforms.setNodes(
        editor,
        { [format]: isActive ? null : true },
        { match: Text.isText, split: true }
    );
};

const isFormatActive = (editor: Editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => n[format] === true,
        mode: "all",
    });
    return !!match;
};

const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underlined) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

const HoveringToolbar = () => {
    const ref = useRef<HTMLDivElement | null>();
    const editor = useSlate();
    const inFocus = useFocused();

    useEffect(() => {
        const el = ref.current;
        const { selection } = editor;

        if (!el) {
            return;
        }

        if (
            !selection ||
            !inFocus ||
            Range.isCollapsed(selection) ||
            Editor.string(editor, selection) === ""
        ) {
            el.removeAttribute("style");
            return;
        }

        const domSelection = window.getSelection();
        const domRange = domSelection.getRangeAt(0);
        const rect = domRange.getBoundingClientRect();
        el.style.opacity = "1";
        el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
        el.style.left = `${
            rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
        }px`;
    });

    return (
        <Portal>
            <Menu
                ref={ref}
                className={css`
                    padding: 8px 7px 6px;
                    font-size: 10px;
                    position: absolute;
                    z-index: 1;
                    top: -10000px;
                    left: -10000px;
                    margin-top: -6px;
                    opacity: 0;
                    background-color: #222;
                    border-radius: 4px;
                    transition: opacity 0.5s;
                `}
                onMouseDown={(e) => {
                    // prevent toolbar from taking focus away from editor
                    e.preventDefault();
                }}
            >
                <FormatButton format="bold" icon="format_bold" />
                <FormatButton format="italic" icon="format_italic" />
                <FormatButton format="underlined" icon="format_underlined" />
                <SummarizeButton />
            </Menu>
        </Portal>
    );
};

const FormatButton = ({ format, icon }) => {
    const editor = useSlate();
    return (
        <Button
            reversed
            active={isFormatActive(editor, format)}
            onClick={() => toggleFormat(editor, format)}
        >
            <Icon>{icon}</Icon>
        </Button>
    );
};

const SummarizeButton = () => {
    const editor = useSlate();
    const model = useContext(modelContext);
    return (
        <Button reversed onClick={() => handleSummarize(model, editor)}>
            <Icon>{"summarize"}</Icon>
        </Button>
    );
};

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            { text: "This is editable " },
            { text: "rich", bold: true },
            { text: " text, " },
            { text: "much", italic: true },
            { text: " better than a " },
            { text: "!" },
        ],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "This document reflects the strategy we’ve refined over the past two years, including feedback from many people internal and external to OpenAI. The timeline to AGI remains uncertain, but our Charter will guide us in acting in the best interests of humanity throughout its development. OpenAI’s mission is to ensure that artificial general intelligence (AGI)—by which we mean highly autonomous systems that outperform humans at most economically valuable work—benefits all of humanity. We will attempt to directly build safe and beneficial AGI, but will also consider our mission fulfilled if our work aids others to achieve this outcome. To that end, we commit to the following principles\n Broadly distributed benefits\n We commit to use any influence we obtain over AGI’s deployment to ensure it is used for the benefit of all, and to avoid enabling uses of AI or AGI that harm humanity or unduly concentrate power.Our primary fiduciary duty is to humanity. We anticipate needing to marshal substantial resources to fulfill our mission, but will always diligently act to minimize conflicts of interest among our employees and stakeholders that could compromise broad benefit.\nLong-term safety\nWe are committed to doing the research required to make AGI safe, and to driving the broad adoption of such research across the AI community. We are concerned about late-stage AGI development becoming a competitive race without time for adequate safety precautions. Therefore, if a value-aligned, safety-conscious project comes close to building AGI before we do, we commit to stop competing with and start assisting this project. We will work out specifics in case-by-case agreements, but a typical triggering condition might be “a better-than-even chance of success in the next two years.”\n Technical Leadership \n To be effective at addressing AGI’s impact on society, OpenAI must be on the cutting edge of AI capabilities—policy and safety advocacy alone would be insufficient. We believe that AI will have broad societal impact before AGI, and we’ll strive to lead in those areas that are directly aligned with our mission and expertise. \n Cooperative Coordination \n We will actively cooperate with other research and policy institutions; we seek to create a global community working together to address AGI’s global challenges.We are committed to providing public goods that help society navigate the path to AGI. Today this includes publishing most of our AI research, but we expect that safety and security concerns will reduce our traditional publishing in the future, while increasing the importance of sharing safety, policy, and standards research.",
            },
        ],
    },
    {
        type: "paragraph",
        children: [
            { text: "This is editable " },
            { text: "rich", bold: true },
            { text: " text, " },
            { text: "much", italic: true },
            { text: " better than a " },
            { text: "!" },
        ],
    },
];

export default HoveringMenuExample;
