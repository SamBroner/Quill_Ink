import Quill, { Sources } from "quill";
import { tob,
        aPending,
        bPending,
        start,
        ACatchUp,
        ALabel,
        ALogButton,
        ARemoteButton,
        BCatchUp,
        BLabel,
        BLogButton,
        BRemoteButton,
        quillConfig} from "./globals";
import { updateOpList, updateJSON, IDelta, updateOpLabel } from "./utils";


let EditorA_IndexOfRemoteOps = 0;
let EditorB_IndexOfRemoteOps = 0;

/**
 * 
 * Take an op off the TOB and apply it to the local state, accounting for any unseen ops
 * TODO: account for pending ops 
 *      (pending hasn't been implemented as a concept, right now ops get generated and are immediately ordered)
 * 
 * @param editor The QuillJS Editor that gets the change
 * @param index The Sequence number to pull from total order broadcast
 * @param source string source ("client, api, silent")
 * @param editorId editorid of the editor
 * @returns void
 */
function apply(editor: Quill, index: number, source: Sources, editorId: string): void {
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
        updateOpLabel(ALabel, EditorA_IndexOfRemoteOps);
    } else if (editorId === "b") {
        updateOpLabel(BLabel, EditorB_IndexOfRemoteOps);
    }
}

function getStarted(editorA: Quill, editorB: Quill) {
    (start as IDelta).user = "start";
    tob.push(start as IDelta);

    updateOpList();
}

export function main() {
    const editorADiv = document.getElementById("editorA")!;
    const editorAJson = document.getElementById("editorAJson")!;

    const editorBDiv = document.getElementById("editorB")!;
    const editorBJson = document.getElementById("editorBJson")!;

    const editorA = new Quill(editorADiv, quillConfig);
    const editorB = new Quill(editorBDiv, quillConfig);

    ARemoteButton.onclick = () => apply(editorA, EditorA_IndexOfRemoteOps++, "api", "a");
    ALogButton.onclick = () => console.log(editorA.getContents());
    ACatchUp.onclick = () => { 
        while(EditorA_IndexOfRemoteOps < tob.length ) {
            apply(editorA, EditorA_IndexOfRemoteOps++, "api", "a");
        }
    }

    BRemoteButton.onclick = () => apply(editorB, EditorB_IndexOfRemoteOps++, "api", "b");
    BLogButton.onclick = () => console.log(editorB.getContents());
    BCatchUp.onclick = () => { 
        while(EditorB_IndexOfRemoteOps < tob.length ) {
            apply(editorB, EditorB_IndexOfRemoteOps++, "api", "b");
        }
    }


    /**
     * Listen to changes in the editor & broadcast them if they're generated locally
     *  (remote changes are source === "api", "api" is given as source in the apply function)
     */
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
