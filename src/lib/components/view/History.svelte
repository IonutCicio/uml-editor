<script lang="ts">
    import { graph, pauseGraphToJSON } from "$lib/utils";
    import { Undo, Redo } from "@lucide/svelte";
    import { onMount } from "svelte";

    const HISTORY_SIZE: number = 20;

    let history: any[] = new Array(HISTORY_SIZE);
    let history_length: number = $state(0);
    let history_index: number = $state(-1);

    onMount(() => {
        history_index++;
        history_length++;

        // TODO: WAIT A MINUTE! Why use toJSON when you can clone the object itself, and just assign it?
        const diagramJSON = localStorage.getItem("diagram");
        if (diagramJSON) {
            history[history_index] = JSON.parse(diagramJSON);
        } else {
            history[history_index] = graph.toJSON();
        }
    });

    graph.on("add remove change", function () {
        if ($pauseGraphToJSON) {
            return;
        }

        if (history_index < history_length - 1) {
            history_index++;
            history_length = history_index + 1;
            history[history_index] = graph.toJSON();
            return;
        }

        if (history_length >= HISTORY_SIZE) {
            history.shift();
            history.push(graph.toJSON());
            return;
        }

        history_index++;
        history_length++;
        history[history_index] = graph.toJSON();
    });

    function undo() {
        if (history_index > 0) {
            history_index--;
            graph.fromJSON(history[history_index]);
            localStorage.setItem("diagram", JSON.stringify(graph.toJSON()));
        }
    }

    function redo() {
        if (history_index < history_length - 1) {
            history_index++;
            graph.fromJSON(history[history_index]);
            localStorage.setItem("diagram", JSON.stringify(graph.toJSON()));
        }
    }
</script>

<svelte:window
    onkeydown={(event: KeyboardEvent) => {
        if (!(event.ctrlKey || event.metaKey)) {
            return;
        }

        if (event.key === "z") {
            event.preventDefault();
            undo();
            return;
        }

        if (event.key === "Z") {
            event.preventDefault();
            redo();
            return;
        }
    }}
/>

<button title="Undo" class="icon" onclick={undo} disabled={history_index <= 0}>
    <Undo size={16} />
</button>
<button
    title="Redo"
    class="icon"
    onclick={redo}
    disabled={history_index === history_length - 1}
>
    <Redo size={16} />
</button>
