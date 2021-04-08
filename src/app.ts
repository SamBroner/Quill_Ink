import Quill, { Sources } from "quill";
import {
    tob,
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
    consistency,
} from "./globals";
import { updateJSON, IDelta, updateOpLabel, sendPending } from "./utils";

let EditorA_IndexOfRemoteOps = 0;
let EditorB_IndexOfRemoteOps = 0;

/**
 * 
 * Take an op off the TOB and apply it to the local state, accounting for any unseen ops
 * 
 * @param editor The QuillJS Editor that gets the change
 * @param index The Sequence number to pull from total order broadcast
 * @param source string source ("client, api, silent")
 * @param editorId editorid of the editor
 * @returns void
 */
function apply(editor: Quill, op: IDelta, source: Sources, editorId: string): void {

    let refSeq = op.refSeq
    let editorRefSeq = op.seq; // This is equivalent to deltamanager.refSeq
    let pending = new Array<IDelta>();
    if (editorId === "a") {
        pending = aPending;
    } else if (editorId === "b") {
        pending = bPending;
    }

    if (op.user === editorId) {
        // Is any action necessary here?
    } else {
        // This is hardly cheating, but we'd want to maintain this in the dds itself
        const collabWindow = tob.slice(refSeq, editorRefSeq);

        // IRL, there would be pending ops that didn't make it to the server
        // e.g. op (thisOp) is always before
        for (const delta of pending) {
            if (op.user === delta.user) {
                pending.shift();
            }
            else { // pending are always 
                let temp = delta.transform(op, false) // op happened before
                op.ops = temp.ops;
            }
        }

        for (const delta of collabWindow) {
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
    (start as IDelta).seq = 0;
    tob.push(start as IDelta);
}

export function main() {

    const editorA = new Quill(editorADiv, quillConfig);
    const editorB = new Quill(editorBDiv, quillConfig);

    ARemoteButton.onclick = () => apply(editorA, tob[EditorA_IndexOfRemoteOps++], "api", "a");
    ASendPendingButton.onclick = () => {
        sendPending(aPending, APendingLabel);
        updateOpLabel(APendingLabel, aPending.length);
    }
    ACatchUp.onclick = () => {
        while (EditorA_IndexOfRemoteOps < tob.length) {
            apply(editorA, tob[EditorA_IndexOfRemoteOps++], "api", "a");
        }
        while (aPending.length > 0) {
            sendPending(aPending, APendingLabel);
            updateOpLabel(APendingLabel, aPending.length);
        }
    }

    BRemoteButton.onclick = () => apply(editorB, tob[EditorB_IndexOfRemoteOps++], "api", "b");
    BSendPendingButton.onclick = () => {
        sendPending(bPending, BPendingLabel);
        updateOpLabel(BPendingLabel, bPending.length)
    }
    BCatchUp.onclick = () => {
        while (EditorB_IndexOfRemoteOps < tob.length) {
            apply(editorB, tob[EditorB_IndexOfRemoteOps++], "api", "b");
        }
        while (bPending.length > 0) {
            sendPending(bPending, BPendingLabel);
            updateOpLabel(BPendingLabel, bPending.length)
        }
    }

    consistency.onclick = () => {
        const aContents = editorA.getContents();
        const bContents = editorB.getContents();

        if (aContents.diff(bContents).length() !== 0) {
            if (EditorB_IndexOfRemoteOps === EditorA_IndexOfRemoteOps
                && bPending.length === 0 && aPending.length === 0) {
                alert(`Editor A & Editor B are not consistent. You have a problem`)
            } else {
                alert("Editors not consistent. However, your editors have pending or remote ops. Catch up both editors, then try again.")
            }
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
        }
        updateJSON(editorAJson, editorA.getContents() as any);
    })

    editorB.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
            (delta as IDelta).user = "b";
            (delta as IDelta).refSeq = EditorB_IndexOfRemoteOps;
            (delta as IDelta).seq = tob.length;
            bPending.push(delta as IDelta);
        }
        updateJSON(editorBJson, editorB.getContents() as any);
    })

    // Seed Data
    getStarted(editorA, editorB);
}

main();
