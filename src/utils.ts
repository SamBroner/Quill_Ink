import JSONFormatter from "json-formatter-js";
import Delta from "quill-delta";
import { tob } from "./globals";


export function updateJSON(el: HTMLElement, jsonable: any) {
    el.innerHTML = "";
    const json = new JSONFormatter(jsonable);
    el.appendChild(json.render());
    json.openAtDepth(3);
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