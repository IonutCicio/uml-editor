<script lang="ts">
    import { type IUMLClass } from "$lib/types/uml";
    import { hexToHSL, HSLToHex } from "$lib/utils";

    const { component }: { component: IUMLClass } = $props();

    let strokeColor = $derived(
        HSLToHex(component.attr("body/stroke") || "#000000"),
    );

    let fillColor = $derived(
        HSLToHex(component.attr("body/fill") || "#ffffff"),
    );

    let definition = $state(component.get("definition") || "");
    $effect(() => {
        component.set("definition", definition);
        component.update();
    });

    const changeStyle = (
        e: Event & { currentTarget: EventTarget & HTMLInputElement },
        type: "stroke" | "fill",
    ) => {
        const obj = hexToHSL(e.currentTarget.value);
        const value = `hsl(${obj.h}, ${obj.s}%, ${obj.l}%)`;
        switch (type) {
            case "stroke":
                component.attr("body/stroke", value);
                break;
            case "fill":
                component.attr("body/fill", value);
        }
    };
</script>

<div class="w-5xl flex flex-col align-middle gap-2">
    <div>
        <label for="definition" class="text-sm mb-1">Definition</label>
        <textarea
            id="definition"
            class="w-full h-96 p-4 border border-black"
            bind:value={definition}
        >
        </textarea>
    </div>
    <div class="grid grid-cols-2 gap-5 w-fit">
        <label for="strokeColor">Stroke color</label>
        <input
            id="strokeColor"
            type="color"
            bind:value={strokeColor}
            onchange={(e) => changeStyle(e, "stroke")}
            class="w-8 h-8 cursor-pointer"
        />
        <label for="fillColor">Fill color</label>
        <input
            id="fillColor"
            type="color"
            bind:value={fillColor}
            onchange={(e) => changeStyle(e, "fill")}
            class="w-8 h-8 cursor-pointer"
        />
    </div>
</div>
