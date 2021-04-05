import Quill, { Sources } from "quill";
import Delta from "quill-delta";
import JSONFormatter from 'json-formatter-js'

interface IDelta extends Delta {
    user: string;
    refSeq: number;
    seq: number;
}

let start = new Delta().insert("Hello ").insert("World", { bold: true }).insert("!");
const tob = new Array<IDelta>();
const aPending = new Array<IDelta>();
const bPending = new Array<IDelta>();

let EditorA_IndexOfRemoteOps = 0;

let EditorB_IndexOfRemoteOps = 0;

const ARemoteButton = document.getElementById("A-ApplyRemote") as HTMLButtonElement;
const ALogButton = document.getElementById("A-LogDeltas") as HTMLButtonElement;
const ACatchUp = document.getElementById("A-CatchUp") as HTMLButtonElement;
const ALabel = document.getElementById("A-Local-Number") as HTMLLabelElement;

const BRemoteButton = document.getElementById("B-ApplyRemote") as HTMLButtonElement;
const BLogButton = document.getElementById("B-LogDeltas") as HTMLButtonElement;
const BCatchUp = document.getElementById("B-CatchUp") as HTMLButtonElement;
const BLabel = document.getElementById("B-Local-Number") as HTMLLabelElement;

/**
 * 
 * This is the 
 * 
 * @param editor 
 * @param index 
 * @param source 
 * @param editorId 
 * @returns 
 */
function apply(editor: Quill, index: number, source: Sources, editorId: string) {
    let op = tob[index];
    
    let refSeq = op.refSeq
    let editorRefSeq = op.seq; // This is equivalent to deltamanager.refSeq

    if (tob.length <= index) {
        alert("no more ops");
        return;
    } else if (tob[index].user === editorId) {
        if (editorId === "a") aPending.shift();
        else if (editorId === "b") bPending.shift();
    } else {
        
        const deltas = tob.slice(refSeq, editorRefSeq);

        for (const delta of deltas) {
            if (op.user === delta.user) {
                // skip
            } else if (op.seq < delta.seq) {
                let temp = delta.transform(op, false) // op happened before
                op.ops = temp.ops;
            } else {
                let temp = delta.transform(op, true) // delta happened before
                op.ops = temp.ops;
            }
        }

        // IRL, there would be pending ops that didn't make it to the server
        // e.g. op (thisOp) is always before
        // for (const delta of pending) {
        //     if (op.seq < delta.seq) {
        //         let temp = delta.transform(op, true)
        //         op.ops = temp.ops;
        //     }
        //     else {
        //         let temp = delta.transform(op, false)
        //         op.ops = temp.ops;
        //     }
        // }

        editor.updateContents(op, source);
    }
    
    if (editorId === "a") {
        ALabel.innerText = `Op Number: ${EditorA_IndexOfRemoteOps-1}`;
    } else if (editorId === "b") {
        BLabel.innerText = `Op Number: ${EditorB_IndexOfRemoteOps-1}`;
    }
}

function getStarted(editorA: Quill, editorB: Quill) {
    (start as IDelta).user = "start";
    tob.push(start as IDelta);

    updateOpList();
}

function updateOpList() {
    const opsListDiv = document.getElementById("ops") as HTMLDivElement;
    updateJSON(opsListDiv, tob);
}

function updateJSON(el: HTMLElement, jsonable: any) {
    el.innerHTML = "";
    const json = new JSONFormatter(jsonable);
    el.appendChild(json.render());
    json.openAtDepth(3);
}

export function main() {
    const editorADiv = document.getElementById("editorA")!;
    const editorAJson = document.getElementById("editorAJson")!;

    const editorBDiv = document.getElementById("editorB")!;
    const editorBJson = document.getElementById("editorBJson")!;

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
            syntax: true,
            table: true,
        },
        theme: "snow",
    });

    const editorB = new Quill(editorBDiv, {
        modules: {
            toolbar: toolbarOptions,
            syntax: true,
            table: true,
        },
        theme: "snow",
    });

    ARemoteButton.onclick = () => apply(editorA, EditorA_IndexOfRemoteOps++, "api", "a");
    ALogButton.onclick = () => console.log(editorA.getContents());
    ACatchUp.onclick = () => { 
        while(EditorA_IndexOfRemoteOps < tob.length ) {
            apply(editorA, EditorA_IndexOfRemoteOps++, "api", "a");
        }
    }
    editorA.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
            (delta as IDelta).user = "a";
            (delta as IDelta).refSeq = EditorA_IndexOfRemoteOps;
            (delta as IDelta).seq = tob.length;
            aPending.push(delta as IDelta);
            tob.push(delta as IDelta);
            updateOpList();
        }

        updateJSON(editorAJson, editorA.getContents() as any);
    })

    BRemoteButton.onclick = () => apply(editorB, EditorB_IndexOfRemoteOps++, "api", "b");
    BLogButton.onclick = () => console.log(editorB.getContents());
    BCatchUp.onclick = () => { 
        while(EditorB_IndexOfRemoteOps < tob.length ) {
            apply(editorB, EditorB_IndexOfRemoteOps++, "api", "b");
        }
    }
    editorB.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
            (delta as IDelta).user = "b";
            (delta as IDelta).refSeq = EditorB_IndexOfRemoteOps;
            (delta as IDelta).seq = tob.length;
            bPending.push(delta as IDelta);

            tob.push(delta as IDelta);
            updateOpList();
        }
        updateJSON(editorBJson, editorB.getContents() as any);
    })

    // Seed Data
    getStarted(editorA, editorB);
}
main();