// @ts-nocheck
import React, {
    useMemo,
    useRef,
    useEffect,
    useContext,
    useCallback,
} from "react";
import { Slate, Editable, withReact, useSlate, useFocused } from "slate-react";
import {
    Editor,
    Transforms,
    Text,
    createEditor,
    Point,
    Element as SlateElement,
    Range,
} from "slate";
import { css } from "@emotion/css";
import { withHistory } from "slate-history";
import { BulletedListElement } from "../../custom-types";

import {
    Button,
    Icon,
    Menu,
    Portal,
} from "./components";
import { InferenceSession } from "@rumbl/laserbeak";
import defaultText from "./defaultText";
import { handleSummarize, handleTranslate } from "./commands";

const sessionContext = React.createContext<InferenceSession | null>(null);

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
    session: InferenceSession | null;
}

const SummizeEditor = (props: EditorProps) => {
    const { session } = props;

    const renderElement = useCallback(
        (props: any) => <Element {...props} />,
        []
    );
    const editor = useMemo(
        () => withShortcuts(withReact(withHistory(createEditor()))),
        []
    );

    return (
        <Slate editor={editor} value={defaultText}>
            <sessionContext.Provider value={session}>
                <HoveringToolbar />
                <Editable
                    renderLeaf={(props) => <Leaf {...props} />}
                    placeholder="Enter some text..."
                    renderElement={renderElement}
                    style={{
                        minWidth: "90%",
                        minHeight: "90%",
                    }}
                    className="prose mx-auto"
                    spellCheck
                    autoFocus
                />
            </sessionContext.Provider>
        </Slate>
    );
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

    if (leaf.code) {
        children = <code>{children}</code>;
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
                <FormatButton format="code" icon="code" />
                <SummarizeButton />
                <TranslateButton />
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
    const session = useContext(sessionContext);
    return (
        <Button reversed onClick={() => handleSummarize(session, editor)}>
            <Icon>{"summarize"}</Icon>
        </Button>
    );
};

const TranslateButton = () => {
    const editor = useSlate();
    const session = useContext(sessionContext);
    return (
        <Button
            reversed
            onClick={() =>
                handleTranslate("English", "French", session, editor)
            }
        >
            <Icon>{"translate"}</Icon>
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

export default SummizeEditor;
