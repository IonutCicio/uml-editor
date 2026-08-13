<script lang="ts">
    import * as joint from "@joint/core";
    import { JointJSClass } from "../JointJS/JointJSClass";
    import { JointJSAssociation } from "../JointJS/JointJSAssociation";
    import { JointJSGeneralization } from "../JointJS/JointJSGeneralization";
    import ColorPicker from "./ColorPicker.svelte";

    const { cellViews }: { cellViews: joint.dia.CellView[] } = $props();

    //const strokeStyles = [
    //    { name: "Solid Thick", value: "0" },
    //    { name: "Dashed", value: "8 8" },
    //    { name: "Long Dashed", value: "15 5" },
    //    { name: "Dense Dashed", value: "20 2" },
    //    { name: "Dotted", value: "2 5" },
    //    { name: "Sparse Dotted", value: "2 10" },
    //];

    const strokeWidths = [1, 2, 3, 4, 5, 6, 7];

    let showFill = $derived(
        cellViews.length > 0 &&
            cellViews.some(
                (cellView) => cellView.model instanceof JointJSClass,
            ),
    );

    let showStroke = $derived(
        cellViews.length > 0 &&
            cellViews.some(
                (cellView) =>
                    cellView.model instanceof JointJSClass ||
                    cellView.model instanceof JointJSAssociation ||
                    cellView.model instanceof JointJSGeneralization,
            ),
    );

    let colorPickerFillOpen = $state(false);
    let colorPickerNameFillOpen = $state(false);
    let colorPickerStrokeOpen = $state(false);

    const applyFillColor = (color: string) => {
        for(const cellView of cellViews) {
            cellView.model.attr("body/fill", color);
        }
    }

    const applyNameFillColor = (color: string) => {
        for(const cellView of cellViews) {
            cellView.model.attr("nameRect/fill", color);
        }
    }

    const applyStrokeColor = (color: string) => {
        for(const cellView of cellViews) {
            cellView.model.attr("body/stroke", color);
        }
    }

</script>

<div class="flex flex-col gap-2 p-4">
    <p class="text-sm font-medium! mb-1">Properties</p>

    {#if showFill}
        <label for="fillColor">Fill</label>
        <button 
            type="button" 
            onclick={() => (colorPickerFillOpen = true)} 
            aria-label="Open Fill Menu"
        >
            Color Picker
        </button>

        <ColorPicker
            open={colorPickerFillOpen}
            onSelect={applyFillColor}
            onClose={() => (colorPickerFillOpen = false)}
        />

        <label for="nameFillColor">Name fill</label>
        <button 
            type="button" 
            onclick={() => (colorPickerNameFillOpen = true)} 
            aria-label="Open Name Fill Menu"
        >
            Color Picker
        </button>

        <ColorPicker
            open={colorPickerNameFillOpen}
            onSelect={applyNameFillColor}
            onClose={() => (colorPickerNameFillOpen = false)}
        />

    {/if}

    {#if showStroke}
        <label for="strokeColor">Stroke</label>
        <button 
            type="button" 
            onclick={() => (colorPickerStrokeOpen = true)} 
            aria-label="Open Fill Menu"
        >
            Color Picker
        </button>

        <ColorPicker
            open={colorPickerStrokeOpen}
            onSelect={applyStrokeColor}
            onClose={() => (colorPickerStrokeOpen = false)}
        />

        <p class="text-sm font-medium! mb-1">Stroke width</p>
        <div class="flex">
            {#each strokeWidths as strokeWidth, i}
                <button
                    class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer`}
                    style={`outline: ${strokeWidth / 1.5}px solid black; outline-offset: -${strokeWidth / 2}px;`}
                    aria-label={`strokeWidth-${i}`}
                    onclick={() => {
                        for (const cellView of cellViews) {
                            if (cellView.model instanceof JointJSClass) {
                                cellView.model.attr(
                                    "body/strokeWidth",
                                    strokeWidth,
                                );
                            } else {
                                cellView.model.attr(
                                    "line/strokeWidth",
                                    strokeWidth,
                                );
                            }
                        }
                    }}
                >
                </button>
            {/each}
        </div>
    {/if}
</div>

<!-- <p class="text-sm font-medium! mb-1">Stroke style</p> -->
<!-- <div class="flex"> -->
<!--     {#each strokeStyles as strokeStyle, i} -->
<!--         <button -->
<!--             class="max-w-4 max-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer" -->
<!--             aria-label={`strokeStyle-${i}`} -->
<!--             onclick={() => { -->
<!--                 //     if (componentIsElement) component.attr("body/strokeDasharray", style); -->
<!--                 //     else component.attr("line/strokeDasharray", style); -->
<!--             }} -->
<!--         > -->
<!--             <svg -->
<!--                 width="100%" -->
<!--                 height="100%" -->
<!--                 viewBox="0 0 24 24" -->
<!--                 preserveAspectRatio="none" -->
<!--             > -->
<!--                 <rect -->
<!--                     x="1" -->
<!--                     y="1" -->
<!--                     width="22" -->
<!--                     height="22" -->
<!--                     fill="none" -->
<!--                     stroke="black" -->
<!--                     stroke-width="2" -->
<!--                     stroke-dasharray={strokeStyle.value} -->
<!--                     stroke-linecap={strokeStyle.name -->
<!--                         .toLowerCase() -->
<!--                         .includes("dotted") -->
<!--                         ? "round" -->
<!--                         : "butt"} -->
<!--                 /> -->
<!--             </svg> -->
<!--         </button> -->
<!--     {/each} -->
<!-- </div> -->

<!-- /* -->
<!-- import { darkenHSL, getBorderColor } from "$lib/utils"; -->
<!-- import ClassInspector from "./ClassInspector.svelte"; -->
<!-- import AssociationInspector from "./AssociationInspector.svelte"; -->
<!-- import GeneralizationInspector from "./GeneralizationInspector.svelte"; -->
<!-- */ -->
<!-- /* const fillColors = [ -->
<!--     "hsl(0,0%,100%)", -->
<!--     "hsl(280,27%,87%)", -->
<!--     "hsl(215,85%,92%)", -->
<!--     "hsl(117,30%,87%)", -->
<!--     "hsl(31,100%,90%)", -->
<!--     "hsl(45,100%,90%)", -->
<!--     "hsl(3,76%,89%)", -->
<!-- ]; */ -->

<!-- // const fillStyles = ["default"]; -->

<!-- {#if cellViews.length === 1} -->
<!--     <hr class="m-4" /> -->
<!--     {#if cellViews[0].model instanceof JointJSClass} -->
<!--         <ClassInspector component={cellViews[0].model} /> -->
<!--     {:else if cellViews[0].model instanceof JointJSAssociation} -->
<!--         <AssociationInspector component={cellViews[0].model} /> -->
<!--     {:else if cellViews[0].model instanceof JointJSGeneralization} -->
<!--         <GeneralizationInspector component={cellViews[0].model} /> -->
<!--     {/if} -->
<!-- {/if} -->

<!-- <div class="flex"> -->
<!-- {#each fillColors as fillColor, i} -->
<!--     <button -->
<!--         class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 cursor-pointer`} -->
<!--         style={`background-color: ${fillColor}; border: solid 2px ${getBorderColor(fillColor)};`} -->
<!--         aria-label={`stroke-${i}`} -->
<!--         onclick={() => { -->
<!--             for (const cellView of cellViews) { -->
<!--                 const color = getBorderColor(fillColor); -->
<!---->
<!--                 if (cellView.model instanceof JointJSClass) { -->
<!--                     cellView.model.attr("body/stroke", color); -->
<!--                 } else { -->
<!--                     cellView.model.attr("line/stroke", color); -->
<!--                 } -->
<!--             } -->
<!--         }} -->
<!--     > -->
<!--     </button> -->
<!-- {/each} -->
<!-- </div> -->

<!-- onchange={(e) => changeStyle(e, "stroke")} -->

<!-- <div class="flex"> -->
<!--     {#each fillColors as fillColor, i} -->
<!--         <button -->
<!--             class="min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 cursor-pointer" -->
<!--             style={`background-color: ${fillColor}; border: solid 2px ${getBorderColor(fillColor)};`} -->
<!--             aria-label={`stroke-${i}`} -->
<!--             onclick={() => { -->
<!--                 for (const cellView of cellViews) { -->
<!--                     cellView.model.attr("body/fill", fillColor); -->
<!--                 } -->
<!--             }} -->
<!--         > -->
<!--         </button> -->
<!--     {/each} -->
<!-- </div> -->
<!-- <p class="text-sm font-medium! mb-1">Fill style</p> -->
<!-- <div class="flex"> -->
<!--     {#each fillStyles as fillStyle, i} -->
<!--         <button -->
<!--             class={`min-w-4 min-h-4 mx-1 first:ml-0 last:mr-0 bg-white cursor-pointer`} -->
<!--             aria-label={`fillStyle-${i}`} -->
<!--             onclick={() => {}} -->
<!--         > -->
<!--         </button> -->
<!--     {/each} -->
<!-- </div> -->

<!-- import { hexToHSL, HSLToHex } from "$lib/utils"; -->
<!-- /* $effect(() => { -->
<!--     component.set("definition", definition); -->
<!--     component.update(); -->
<!-- }); */ -->

<!-- let strokeColor = $derived( -->
<!--     HSLToHex(component.attr("body/stroke") || "#000000"), -->
<!-- ); -->
<!---->
<!-- let fillColor = $derived( -->
<!--     HSLToHex(component.attr("body/fill") || "#ffffff"), -->
<!-- ); -->

<!-- const changeStyle = ( -->
<!--     e: Event & { currentTarget: EventTarget & HTMLInputElement }, -->
<!--     type: "stroke" | "fill", -->
<!-- ) => { -->
<!--     const obj = hexToHSL(e.currentTarget.value); -->
<!--     const value = `hsl(${obj.h}, ${obj.s}%, ${obj.l}%)`; -->
<!--     switch (type) { -->
<!--         case "stroke": -->
<!--             component.attr("body/stroke", value); -->
<!--             break; -->
<!--         case "fill": -->
<!--             component.attr("body/fill", value); -->
<!--     } -->
<!-- }; -->

<!-- <div class="grid grid-cols-2 gap-5 w-fit"> -->
<!--     <label for="strokeColor">Stroke color</label> -->
<!--     <input -->
<!--         id="strokeColor" -->
<!--         type="color" -->
<!--         bind:value={strokeColor} -->
<!--         onchange={(e) => changeStyle(e, "stroke")} -->
<!--         class="w-8 h-8 cursor-pointer" -->
<!--     /> -->
<!--     <label for="fillColor">Fill color</label> -->
<!--     <input -->
<!--         id="fillColor" -->
<!--         type="color" -->
<!--         bind:value={fillColor} -->
<!--         onchange={(e) => changeStyle(e, "fill")} -->
<!--         class="w-8 h-8 cursor-pointer" -->
<!--     /> -->
<!-- </div> -->
