<script lang="ts">
    import { EditorMode, paper } from "$lib/utils";
    import * as joint from "@joint/core";

    let {
        editorMode = $bindable(),
        mouseButton = $bindable(),
    }: { editorMode: EditorMode; mouseButton: number } = $props();

    let initialClientX: number = 0;
    let initialClientY: number = 0;
    let initialTranslateX: number = 0;
    let initialTranslateY: number = 0;

    paper.on("blank:pointerdown", function (event: joint.dia.Event) {
        initialClientX = event.clientX || 0;
        initialClientY = event.clientY || 0;

        const translate = paper.translate();
        initialTranslateX = translate.tx;
        initialTranslateY = translate.ty;
    });

    paper.on("blank:pointermove", function (event: joint.dia.Event) {
        if (editorMode !== EditorMode.Panning && mouseButton !== 1) {
            return;
        }

        const dx = (event.clientX || 0) - initialClientX;
        const dy = (event.clientY || 0) - initialClientY;

        paper.translate(initialTranslateX + dx, initialTranslateY + dy);
    });
</script>
