export const theme = {
    colors: {
        primary: "#111111",
        secondary: "magenta",
        background: "#fffffa",
    },
};

// TODO refactor to be less verbose
export const t = (fn: (t: typeof theme) => string): any => {
    return (props: any) => {
        return fn(props.theme);
    };
};
