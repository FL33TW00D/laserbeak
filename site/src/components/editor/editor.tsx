// @ts-nocheck
import React, {
    useMemo,
    useRef,
    useEffect,
    useContext,
    useCallback,
} from "react";
import {
    Slate,
    Editable,
    withReact,
    useSlate,
    useFocused,
    ReactEditor,
} from "slate-react";
import {
    Editor,
    Transforms,
    Text,
    createEditor,
    Descendant,
    Point,
    Element as SlateElement,
    Range,
    Node as SlateNode,
} from "slate";
import { css } from "@emotion/css";
import { withHistory } from "slate-history";
import { BulletedListElement } from "../../custom-types";

import { Button, Icon, Menu, Portal } from "./components";

const modelContext = React.createContext<any | null>(null);

const SHORTCUTS = {
    "*": "list-item",
    "-": "list-item",
    "+": "list-item",
    ">": "block-quote",
    "#": "heading-one",
    "##": "heading-two",
    "###": "heading-three",
    "####": "heading-four",
    "#####": "heading-five",
    "######": "heading-six",
};

interface EditorProps {
    model: any;
}

const SummizeEditor = (props: EditorProps) => {
    const { model } = props;

    const renderElement = useCallback((props: any) => <Element {...props} />, []);
    const editor = useMemo(
        () => withShortcuts(withReact(withHistory(createEditor()))),
        []
    );
    const handleDOMBeforeInput = useCallback(
        (e: InputEvent) => {
            switch (e.inputType) {
                case "formatBold":
                    e.preventDefault();
                    toggleFormat(editor, "bold");
                    break;
                case "formatItalic":
                    e.preventDefault();
                    toggleFormat(editor, "italic");
                    break;
                case "formatunderline":
                    e.preventDefault();
                    toggleFormat(editor, "underlined");
                    break;
                case "summarize":
                    e.preventDefault();
                    handleSummarize(model, editor);
                    break;
            }
            queueMicrotask(() => {
                const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

                const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
                    if (!diff.text.endsWith(" ")) {
                        return false;
                    }

                    const { text } = SlateNode.leaf(editor, path);
                    const beforeText =
                        text.slice(0, diff.start) + diff.text.slice(0, -1);
                    if (!(beforeText in SHORTCUTS)) {
                        return;
                    }

                    const blockEntry = Editor.above(editor, {
                        at: path,
                        match: (n) =>
                            SlateElement.isElement(n) &&
                            Editor.isBlock(editor, n),
                    });
                    if (!blockEntry) {
                        return false;
                    }

                    const [, blockPath] = blockEntry;
                    return Editor.isStart(
                        editor,
                        Editor.start(editor, path),
                        blockPath
                    );
                });

                if (scheduleFlush) {
                    ReactEditor.androidScheduleFlush(editor);
                }
            });
        },
        [editor, model]
    );

    return (
        <Slate editor={editor} value={initialValue}>
            <modelContext.Provider value={model}>
                <HoveringToolbar />
                <Editable
                    renderLeaf={(props) => <Leaf {...props} />}
                    placeholder="Enter some text..."
                    renderElement={renderElement}
                    onDOMBeforeInput={handleDOMBeforeInput}
                    style={{
                        minWidth: "90%",
                    }}
                    className="prose mx-auto"
                    spellCheck
                    autoFocus
                />
            </modelContext.Provider>
        </Slate>
    );
};

async function runSample(
    model: any,
    editor: Editor,
    inputText: string,
    selection: Range 
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
    if (!editor.selection) {
        return;
    }
    let input_selection = Editor.string(editor, editor.selection);
    let input_text = `Summarize\n\n${input_selection}`;
    Transforms.delete(editor, { at: editor.selection });
    runSample(model, editor, input_text, editor.selection);
};

const toggleFormat = (editor: Editor, format: string) => {
    const isActive = isFormatActive(editor, format);
    Transforms.setNodes(
        editor,
        { [format]: isActive ? null : true },
        { match: Text.isText, split: true }
    );
};

const isFormatActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => n[format] === true,
        mode: "all",
    });
    return !!match;
};

interface LeafProps {
    attributes: any;
    children: any;
    leaf: any;
}

const Leaf = ({ attributes, children, leaf }: LeafProps) => {
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
        const domRange = domSelection!.getRangeAt(0);
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
                ref={ref as any}
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

const withShortcuts = (editor) => {
    const { deleteBackward, insertText } = editor;

    editor.insertText = (text) => {
        const { selection } = editor;

        if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = Editor.above(editor, {
                match: (n) =>
                    SlateElement.isElement(n) && Editor.isBlock(editor, n),
            });
            const path = block ? block[1] : [];
            const start = Editor.start(editor, path);
            const range = { anchor, focus: start };
            const beforeText = Editor.string(editor, range) + text.slice(0, -1);
            const type = SHORTCUTS[beforeText];

            if (type) {
                Transforms.select(editor, range);

                if (!Range.isCollapsed(range)) {
                    Transforms.delete(editor);
                }

                const newProperties: Partial<SlateElement> = {
                    type,
                };
                Transforms.setNodes<SlateElement>(editor, newProperties, {
                    match: (n) =>
                        SlateElement.isElement(n) && Editor.isBlock(editor, n),
                });

                if (type === "list-item") {
                    const list: BulletedListElement = {
                        type: "bulleted-list",
                        children: [],
                    };
                    Transforms.wrapNodes(editor, list, {
                        match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "list-item",
                    });
                }

                return;
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (...args) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: (n) =>
                    SlateElement.isElement(n) && Editor.isBlock(editor, n),
            });

            if (match) {
                const [block, path] = match;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    block.type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<SlateElement> = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newProperties);

                    if (block.type === "list-item") {
                        Transforms.unwrapNodes(editor, {
                            match: (n) =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === "bulleted-list",
                            split: true,
                        });
                    }

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};

const Element = ({ attributes, children, element }) => {
    switch (element.type) {
        case "block-quote":
            return <blockquote {...attributes}>{children}</blockquote>;
        case "bulleted-list":
            return <ul {...attributes}>{children}</ul>;
        case "heading-one":
            return <h1 {...attributes}>{children}</h1>;
        case "heading-two":
            return <h2 {...attributes}>{children}</h2>;
        case "heading-three":
            return <h3 {...attributes}>{children}</h3>;
        case "heading-four":
            return <h4 {...attributes}>{children}</h4>;
        case "heading-five":
            return <h5 {...attributes}>{children}</h5>;
        case "heading-six":
            return <h6 {...attributes}>{children}</h6>;
        case "list-item":
            return <li {...attributes}>{children}</li>;
        default:
            return <p {...attributes}>{children}</p>;
    }
};
const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "This document reflects the strategy we’ve refined over the past two years, including feedback from many people internal and external to OpenAI. The timeline to AGI remains uncertain, but our Charter will guide us in acting in the best interests of humanity throughout its development. OpenAI’s mission is to ensure that artificial general intelligence (AGI)—by which we mean highly autonomous systems that outperform humans at most economically valuable work—benefits all of humanity. We will attempt to directly build safe and beneficial AGI, but will also consider our mission fulfilled if our work aids others to achieve this outcome. To that end, we commit to the following principles:",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Broadly distributed benefits" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "We commit to use any influence we obtain over AGI’s deployment to ensure it is used for the benefit of all, and to avoid enabling uses of AI or AGI that harm humanity or unduly concentrate power. Our primary fiduciary duty is to humanity. We anticipate needing to marshal substantial resources to fulfill our mission, but will always diligently act to minimize conflicts of interest among our employees and stakeholders that could compromise broad benefit.",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Long-term safety" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "We are committed to doing the research required to make AGI safe, and to driving the broad adoption of such research across the AI community. We are concerned about late-stage AGI development becoming a competitive race without time for adequate safety precautions. Therefore, if a value-aligned, safety-conscious project comes close to building AGI before we do, we commit to stop competing with and start assisting this project. We will work out specifics in case-by-case agreements, but a typical triggering condition might be “a better-than-even chance of success in the next two years.",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Technical Leadership" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "To be effective at addressing AGI’s impact on society, OpenAI must be on the cutting edge of AI capabilities—policy and safety advocacy alone would be insufficient. We believe that AI will have broad societal impact before AGI, and we’ll strive to lead in those areas that are directly aligned with our mission and expertise.",
            },
        ],
    },
    {
        type: "heading-two",
        children: [{ text: "Cooperative Coordination" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "We will actively cooperate with other research and policy institutions; we seek to create a global community working together to address AGI’s global challenges. We are committed to providing public goods that help society navigate the path to AGI. Today this includes publishing most of our AI research, but we expect that safety and security concerns will reduce our traditional publishing in the future, while increasing the importance of sharing safety, policy, and standards research.",
            },
        ],
    },
];

export default SummizeEditor;
