# Experiments with the QuillJS Delta format

This is an experiment with the [QuillJS Delta OT](https://github.com/quilljs/delta) solution. It mimics the [Fluid Framework](fluidframework.com) total order broadcast and reuses other Fluid concepts, such as the reference sequence number and sequence number.

The project lets you step through applying operations to understand see how ops get applied and transformed. I used this harness to better understand how operations must be transformed before they're applied.

## ToDo
* Pending ops that aren't ordered yet.
* A minimum sequence number

![web app](./ot%20types.png)