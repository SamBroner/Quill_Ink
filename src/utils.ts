import JSONFormatter from "json-formatter-js";
import Delta from "quill-delta";
import { tob } from "./globals";

export function updateJSON(el: HTMLElement, jsonable: any, depth = 3) {
    el.innerHTML = "";
    const json = new JSONFormatter(jsonable, 3);
    el.appendChild(json.render());
}

export function updateOpList() {
    const opsListDiv = document.getElementById("ops") as HTMLDivElement;
    updateJSON(opsListDiv, tob);
}

export interface IDelta extends Delta {
    user: string;
    refSeq: number;
    seq: number;
}

export function updateOpLabel(label: HTMLLabelElement, num: number) {
    label.innerText = `Ref Seq: ${num}`;
}

export const arrayProxyFactory = (el: HTMLElement, depth?: number) => {
    return {
        set(target: IDelta[], property: string, value: IDelta, receiver) {
            target[property] = value;
            
            if (property === "length") {
                updateJSON(el, target, depth);
            }
            return true;
        },
        get(target: IDelta[], property: string, receiver) {
            return target[property]
        }
    }
}

export const sendPending = (pending: IDelta[], label: HTMLLabelElement) => {
    if (pending.length > 0) {
        const delta = (pending.shift()! as IDelta)
        delta.seq = tob.length
        tob.push(delta)
    }
}