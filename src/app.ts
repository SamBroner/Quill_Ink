import Quill from "quill";
import Delta from "quill-delta";

let start = new Delta().insert("Hello ").insert("World", { bold: true }).insert("!");
let a = new Array<Delta>();
let b = new Array<Delta>();
const tob = new Array<Delta>();

let EditorA_IndexOfLocalOps = 0;
let EditorA_IndexOfRemoteOps = 0;

let EditorB_IndexOfLocalOps = 0;
let EditorB_IndexOfRemoteOps = 0;

const ALocalButton = document.getElementById("A-ApplyLocal") as HTMLButtonElement;
const ARemoteButton = document.getElementById("A-ApplyRemote") as HTMLButtonElement;
const ALogButton = document.getElementById("A-LogDeltas") as HTMLButtonElement;
const BLocalButton = document.getElementById("B-ApplyLocal") as HTMLButtonElement;
const BRemoteButton = document.getElementById("B-ApplyRemote") as HTMLButtonElement;
const BLogButton = document.getElementById("B-LogDeltas") as HTMLButtonElement;

a.push(new Delta().insert('a', { italic: true }));
a.push(new Delta().retain(6).insert(" Sam,"));
a.push(new Delta().delete(7));

b.push(new Delta().insert('b', { bold: true }).retain(5).insert('c', { bold: TextTrackCueList }));

function apply(editor: Quill, deltaList: Delta[], index: number) {
    console.log(index);
    if (deltaList.length <= index) {
        alert("no more ops");
        return;
    }
    editor.updateContents(deltaList[index]);
}

function applyRemoteOp(editor: Quill, delta: Delta) {
    
}

function getStarted(editorA: Quill, editorB: Quill) {
    ALocalButton.click();
    BLocalButton.click();

    /**
 * Transform b and apply it.
 * - This change transforms b with regards to a
 * - The "a op" has already been applied
 * - the "b op" was created without seeing "a op"
 */
    editorA.updateContents(a[0].transform(b[EditorA_IndexOfRemoteOps]))
    // editorA.updateContents(b[EditorA_IndexOfRemoteOps])


    /**
     * Transform a and apply it (priority "true")
     */
    editorB.updateContents(b[0].transform(a[0], true));

}

function updateOpList() {
    const opsListDiv = document.getElementById("ops") as HTMLDivElement;
    opsListDiv.innerHTML = "";
    
    const opsList = new HTMLOListElement();
    opsListDiv.appendChild(opsList);
    for (const )
}

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

    ALocalButton.onclick = () => apply(editorA, a, EditorA_IndexOfLocalOps++);
    ARemoteButton.onclick = () => apply(editorA, b, EditorA_IndexOfRemoteOps++);
    ALogButton.onclick = () => console.log(editorA.getContents());
    editorA.on("text-change", (delta, oldDelta, source) => {
        console.log("----A----")
        console.log("Delta to be applied:");
        console.log(delta);
        console.log("Existing Delta in Editor:");
        console.log(oldDelta);
        console.log("source:");
        console.log(source);
    })

    BLocalButton.onclick = () => apply(editorB, b, EditorB_IndexOfLocalOps++);//editorB.updateContents(b);
    BRemoteButton.onclick = () => apply(editorB, a, EditorB_IndexOfRemoteOps++);//  editorA.updateContents(a);
    BLogButton.onclick = () => console.log(editorB.getContents());
    editorB.on("text-change", (delta, oldDelta, source) => {
        console.log("----B----")
        console.log("Delta to be applied:");
        console.log(delta);
        console.log("Existing Delta in Editor:");
        console.log(oldDelta);
        console.log("source:");
        console.log(source);
    })

    /**
     * Apply editorA local op
     * Apply editorB local op
     */
    getStarted(editorA, editorB);

    /**
     * Notes... 
     * * we need a way to determine consistent op priority
     * * Priority "true" 
     *      * means that in ```this.tranform(other, true)```... ```this``` happened first
     *      * means ```true``` also means that **other** happened second
     *      * therefore
     * * Priority "false"
     *      * means that ```this.tranform(other, false)```...  ```this``` happened second
     */

    /**
     * 
     */
}
main();