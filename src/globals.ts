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
export const ASendPendingButton = document.getElementById("A-SendPending") as HTMLButtonElement;
export const ACatchUp = document.getElementById("A-CatchUp") as HTMLButtonElement;
export const ARefSeqLabel = document.getElementById("A-RefSeq-Number") as HTMLLabelElement;
export const APendingLabel = document.getElementById("A-Pending-Number") as HTMLLabelElement;
export const editorADiv = document.getElementById("editorA") as HTMLDivElement;
export const editorAJson = document.getElementById("editorAJson") as HTMLDivElement;
export const editorAPending = document.getElementById("editorAPending") as HTMLDivElement;


export const BRemoteButton = document.getElementById("B-ApplyRemote") as HTMLButtonElement;
export const BSendPendingButton = document.getElementById("B-SendPending") as HTMLButtonElement;
export const BCatchUp = document.getElementById("B-CatchUp") as HTMLButtonElement;
export const BRefSeqLabel = document.getElementById("B-RefSeq-Number") as HTMLLabelElement;
export const BPendingLabel = document.getElementById("B-Pending-Number") as HTMLLabelElement;
export const editorBDiv = document.getElementById("editorB") as HTMLDivElement;
export const editorBJson = document.getElementById("editorBJson") as HTMLDivElement;
export const editorBPending = document.getElementById("editorBPending") as HTMLDivElement;


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