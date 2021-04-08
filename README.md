# Experiments with the QuillJS Delta format

This is an experiment with the [QuillJS Delta OT](https://github.com/quilljs/delta) solution. It mimics the [Fluid Framework](fluidframework.com) total order broadcast and reuses other Fluid concepts, such as the reference sequence number and sequence number.

The project lets you step through applying operations to understand see how ops get applied and transformed. I used this harness to better understand how operations must be transformed before they're applied.

## Directory
* app.ts -> apply logic & setup
* global.ts -> tob, pending lists, and html elements
* utils.ts -> utils

## ToDo
* A minimum sequence number

![web app](./ot%20types.png)


## Issues
* New lines are messed up
  * Repro
    1. abc in A
    2. abc in B
    3. Catchup in B
    4. Catchup in A