<script lang="ts">
    import { type IUMLClass } from "$lib/types/uml";
    import { onDestroy } from "svelte";

    const { component }: { component: IUMLClass } = $props();

    let definition = $state(component.get("definition") || "");

    onDestroy(() => {
        if (component.get("definition") === definition) {
            return;
        }

        component.set("definition", definition);
        component.update();
    });
</script>

<div class="w-2xl flex flex-col align-middle gap-2">
    <label for="definition">Definition</label>
    <textarea
        id="definition"
        class="w-full h-96 p-4 border border-black"
        spellcheck="false"
        autocapitalize="off"
        bind:value={definition}
        autofocus
    >
    </textarea>
</div>
