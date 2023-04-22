import { useRef } from "react";
import { useSlate } from "slate-react";

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

const MagicButton = () => {
    const editor = useSlate();
    const session = useContext(sessionContext);
    return (
        <Button reversed onClick={() => handleMagic(session, editor)}>
            <Icon>{"auto_fix_normal"}</Icon>
        </Button>
    );
};

export const HoveringToolbar = () => { 
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
                <MagicButton />
            </Menu>
        </Portal>
    );
};
