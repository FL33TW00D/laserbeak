//@ts-nocheck
import React, {
    Ref,
    PropsWithChildren,
} from "react";
import ReactDOM from "react-dom";
import { cx, css } from "@emotion/css";

interface BaseProps {
    className: string;
    [key: string]: unknown;
}
type OrNull<T> = T | null;

export const Button = React.forwardRef(
    (
        {
            className,
            active,
            reversed,
            ...props
        }: PropsWithChildren<
            {
                active: boolean;
                reversed: boolean;
            } & BaseProps
        >,
        ref: Ref<OrNull<HTMLSpanElement>>
    ) => (
        <span
            {...props}
            ref={ref as Ref<HTMLSpanElement>}
            className={cx(
                className,
                css`
                    cursor: pointer;
                    color: ${reversed
                        ? active
                            ? "white"
                            : "#aaa"
                        : active
                        ? "black"
                        : "#ccc"};
                `
            )}
        />
    )
);
Button.displayName = "Button";

export const EditorValue = React.forwardRef(
    (
        {
            className,
            value,
            ...props
        }: PropsWithChildren<
            {
                value: any;
            } & BaseProps
        >,
        ref: Ref<OrNull<null>>
    ) => {
        const textLines = value.document.nodes
            .map((node: any) => node.text)
            .toArray()
            .join("\n");
        return (
            <div
                ref={ref as Ref<HTMLDivElement>}
                {...props}
                className={cx(
                    className,
                    css`
                        margin: 30px -20px 0;
                    `
                )}
            >
                <div
                    className={css`
                        font-size: 14px;
                        padding: 5px 20px;
                        color: #404040;
                        border-top: 2px solid #eeeeee;
                        background: #f8f8f8;
                    `}
                >
                    Slate&apos;s value as text
                </div>
                <div
                    className={css`
                        color: #404040;
                        font: 12px monospace;
                        white-space: pre-wrap;
                        padding: 10px 20px;
                        div {
                            margin: 0 0 0.5em;
                        }
                    `}
                >
                    {textLines}
                </div>
            </div>
        );
    }
);
EditorValue.displayName = "EditorValue";

export const Icon = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLSpanElement>>
    ) => (
        <span
            {...props}
            ref={ref as Ref<HTMLSpanElement>}
            className={cx(
                "material-icons",
                className,
                css`
                    font-size: 18px;
                    vertical-align: text-bottom;
                `
            )}
        />
    )
);
Icon.displayName = "Icon";

export const Instruction = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLDivElement>>
    ) => (
        <div
            {...props}
            ref={ref as Ref<HTMLDivElement>}
            className={cx(
                className,
                css`
                    white-space: pre-wrap;
                    margin: 0 -20px 10px;
                    padding: 10px 20px;
                    font-size: 14px;
                    background: #f8f8e8;
                `
            )}
        />
    )
);
Instruction.displayName = "Instruction";

export const Menu = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLDivElement>>
    ) => (
        <div
            {...props}
            data-test-id="menu"
            ref={ref as Ref<HTMLDivElement>}
            className={cx(
                className,
                css`
                    & > * {
                        display: inline-block;
                    }

                    & > * + * {
                        margin-left: 15px;
                    }
                `
            )}
        />
    )
);
Menu.displayName = "Menu";

export const Portal = ({ children }: { children: React.ReactNode }) => {
    const [portal, setPortal] = React.useState(false);

    React.useEffect(() => {
        setPortal(typeof document === "object");
    }, []);

    return portal ? ReactDOM.createPortal(children, document.body) : null;
};
Portal.displayName = "Portal";

export const Toolbar = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref: Ref<OrNull<HTMLDivElement>>
    ) => (
        <Menu
            {...props}
            ref={ref as Ref<HTMLDivElement>}
            className={cx(
                className,
                css`
                    position: relative;
                    padding: 1px 18px 17px;
                    margin: 0 -20px;
                    border-bottom: 2px solid #eee;
                    margin-bottom: 20px;
                `
            )}
        />
    )
);
Toolbar.displayName = "Toolbar";
