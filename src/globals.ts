import Delta from "quill-delta";
import { IDelta } from "./utils";

/**
 * A bunch of Ugly Globals for convenience
 */
export let start = new Delta().insert("Hello ").insert("World", { bold: true }).insert("!");
export const tob = new Array<IDelta>();
export const aPending = new Array<IDelta>();
export const bPending = new Array<IDelta>();


// HTML & Config stuff
export const ARemoteButton = document.getElementById("A-ApplyRemote") as HTMLButtonElement;
export const ALogButton = document.getElementById("A-LogDeltas") as HTMLButtonElement;
export const ACatchUp = document.getElementById("A-CatchUp") as HTMLButtonElement;
export const ALabel = document.getElementById("A-Local-Number") as HTMLLabelElement;

export const BRemoteButton = document.getElementById("B-ApplyRemote") as HTMLButtonElement;
export const BLogButton = document.getElementById("B-LogDeltas") as HTMLButtonElement;
export const BCatchUp = document.getElementById("B-CatchUp") as HTMLButtonElement;
export const BLabel = document.getElementById("B-Local-Number") as HTMLLabelElement;

export const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],        // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }],               // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],      // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }],          // outdent/indent
    [{ direction: "rtl" }],                         // text direction

    [{ size: ["small", false, "large", "huge"] }],  // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],
    [{ table: true }],

    ["clean"],                                  // remove formatting button
];

export const quillConfig = {
    modules: {
        toolbar: toolbarOptions,
        syntax: true,
        table: true,
    },
    theme: "snow",
};