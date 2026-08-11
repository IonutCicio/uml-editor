<script lang="ts">
    import { UMLClass } from "$lib";
    import { graph } from "$lib/utils";
    import * as joint from "@joint/core";

    // TODO: too much stuff to fix here, I gave a blueprint, but it is not enough
    // TODO: for example, fix spacing if the role is longer than just 0..*

    const { component }: { component: joint.dia.Link } = $props();
    let name = $state<string>("");
    $effect(() => {
        name = component.get("name") || "";
    });
    let sourceRole = $derived<string>(
        component.get("sourceMoltiplicity") || "0..*",
    );
    let targetRole = $derived<string>(
        component.get("targetMultiplicity") || "0..*",
    );

    const sourceName = UMLClass.fromString(
        graph.getCell(component.source().id).get("definition"),
    ).name.value;
    const targetName = UMLClass.fromString(
        graph.getCell(component.target().id).get("definition"),
    ).name.value;
</script>

<div class="align-middle flex flex-col">
    <h3 class="text-xl text-center">Association</h3>

    <label for="name">Name</label>

    <input
        type="text"
        autofocus
        id="name"
        bind:value={name}
        class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition"
        oninput={() => component.set("name", name)}
    />

    <label for="sourceRole">"{sourceName}" role</label>
    <input
        type="text"
        id="sourceRole"
        bind:value={sourceRole}
        class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition"
        oninput={() => component.set("sourceMultiplicity", sourceRole)}
    />

    <label for="targetRole">"{targetName}" role</label>
    <input
        type="text"
        id="targetRole"
        bind:value={targetRole}
        class="w-full rounded-md bg-white text-gray-900 p-1 border border-gray-300 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 transition"
        oninput={() => component.set("targetMultiplicity", targetRole)}
    />
</div>
