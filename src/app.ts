import Quill from "quill";
import Delta from "quill-delta";

let start = new Delta().insert("Hello World");
let a = new Delta().insert('a');
let b = new Delta().insert('b').retain(5).insert('c');

export function main() {
    const editorADiv = document.getElementById("editorA")!;
    const editorBDiv = document.getElementById("editorB")!;


    const toolbarOptions = [
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

    const editorA = new Quill(editorADiv, {
        modules: {
            toolbar: toolbarOptions,
            syntax: true,              // Include syntax module
            table: true,
        },
        theme: "snow",
    });

    const editorB = new Quill(editorBDiv, {
        modules: {
            toolbar: toolbarOptions,
            syntax: true,              // Include syntax module
            table: true,
        },
        theme: "snow",
    });

    editorA.setContents(start);
    editorB.setContents(start);
}
main();