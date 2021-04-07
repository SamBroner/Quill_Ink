import Quill, { Sources } from "quill";
import { tob,
        aPending,
        bPending,
        start,
        ACatchUp,
        ARefSeqLabel,
        ARemoteButton,
        BCatchUp,
        BRefSeqLabel,
        BRemoteButton,
        quillConfig,
        BSendPendingButton,
        ASendPendingButton,
        APendingLabel,
        BPendingLabel,
        editorADiv,
        editorAJson,
        editorBDiv,
        editorBJson,
        editorAPending,
        editorBPending} from "./globals";
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
    let pending = new Array<IDelta>();
    if (editorId === "a") {
        pending = aPending;
    } else if (editorId === "b") {
        pending = bPending;
    }

    if (tob.length <= index) {
        alert("no more ops");
        return;
    // } else if (tob[index].user === editorId) {
        // if (editorId === "a") aPending.shift();
        // else if (editorId === "b") bPending.shift();
    } else {
        
        const deltas = tob.slice(refSeq, editorRefSeq);

        // IRL, there would be pending ops that didn't make it to the server
        // e.g. op (thisOp) is always before
        for (const delta of pending) {
            if (op.seq < delta.seq) {
                let temp = delta.transform(op, true)
                op.ops = temp.ops;
            }
            else {
                let temp = delta.transform(op, false)
                op.ops = temp.ops;
            }
        }

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

        editor.updateContents(op, source);
    }
    
    if (editorId === "a") {
        updateOpLabel(ARefSeqLabel, EditorA_IndexOfRemoteOps);
    } else if (editorId === "b") {
        updateOpLabel(BRefSeqLabel, EditorB_IndexOfRemoteOps);
    }
}

function getStarted(editorA: Quill, editorB: Quill) {
    (start as IDelta).user = "start";
    tob.push(start as IDelta);

    updateOpList();
}

export function main() {

    const editorA = new Quill(editorADiv, quillConfig);
    const editorB = new Quill(editorBDiv, quillConfig);

    ARemoteButton.onclick = () => apply(editorA, EditorA_IndexOfRemoteOps++, "api", "a");
    ASendPendingButton.onclick = () => {
        if (aPending.length > 0) {
            const delta = (aPending.shift()! as IDelta)
            delta.seq = tob.length
            tob.push(delta)
        }
        updateOpLabel(APendingLabel, aPending.length);
        updateOpList();
    }
    ACatchUp.onclick = () => { 
        while(EditorA_IndexOfRemoteOps < tob.length ) {
            apply(editorA, EditorA_IndexOfRemoteOps++, "api", "a");
        }
    }

    BRemoteButton.onclick = () => apply(editorB, EditorB_IndexOfRemoteOps++, "api", "b");
    BSendPendingButton.onclick = () => {
        if (bPending.length > 0) {
            const delta = (bPending.shift()! as IDelta)
            delta.seq = tob.length
            tob.push(delta)
        }
        updateOpLabel(BPendingLabel, bPending.length);
        updateOpList()
    }
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
            aPending.push(delta as IDelta);
            updateOpList();
        }
        updateJSON(editorAPending, aPending);
        updateJSON(editorAJson, editorA.getContents() as any);
    })

    editorB.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
            (delta as IDelta).user = "b";
            (delta as IDelta).refSeq = EditorB_IndexOfRemoteOps;
            (delta as IDelta).seq = tob.length;
            bPending.push(delta as IDelta);
            updateOpList();
        }
        updateJSON(editorBPending, bPending);
        updateJSON(editorBJson, editorB.getContents() as any);
    })

    // Seed Data
    getStarted(editorA, editorB);
}

main();
