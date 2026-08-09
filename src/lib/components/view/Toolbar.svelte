<script lang="ts">
    import { EditorMode } from "$lib/utils";
    import Zoom from "./Zoom.svelte";
    import History from "./History.svelte";
    import { exportJSON, exportSVG, importJSON } from "$lib/utils";
    import {
        Menu,
        Hand,
        SquareDashedMousePointer,
        Rows2,
        MoveDown,
        StickyNote,
        Folder,
        Download,
        Image,
        // Github,
        CircleQuestionMark,
        SquareCenterlineDashedVertical,
        SquareDashed,
        Minus,
        MoveUpRight,
        Circle,
        PersonStanding,
    } from "@lucide/svelte";

    let {
        editorMode = $bindable(EditorMode.Selection),
    }: {
        editorMode: EditorMode;
    } = $props();

    const tools = [
        {
            icon: Hand,
            tooltip: "Panning",
            mode: EditorMode.Panning,
        },
        {
            icon: SquareDashedMousePointer,
            tooltip: "Selection",
            mode: EditorMode.Selection,
        },
        {
            icon: SquareCenterlineDashedVertical,
            tooltip: "Association class line",
            mode: EditorMode.DashedLine,
        },
        {
            icon: MoveDown,
            tooltip: "Generalization",
            mode: EditorMode.Generalization,
        },
        {
            icon: SquareDashed,
            tooltip: "Object",
            mode: EditorMode.Object,
        },
        {
            icon: Minus,
            tooltip: "Link",
            mode: EditorMode.Link,
        },
        {
            icon: MoveUpRight,
            tooltip: "<<instance>>",
            mode: EditorMode.InstanceOf,
        },
        {
            icon: PersonStanding,
            tooltip: "Actor",
            mode: EditorMode.Actor,
        },
        {
            icon: Circle,
            tooltip: "Use case",
            mode: EditorMode.UseCase,
        },
        {
            icon: StickyNote,
            tooltip: "Sticky note",
            mode: EditorMode.Note,
        },
    ];

    let isMenuOpen = $state(false);

    const menuItems = [
        {
            icon: Folder,
            label: "Import project JSON",
            shortcut: "Ctrl + I",
            func: importJSON,
        },
        {
            icon: Download,
            label: "Save project JSON",
            shortcut: "Ctrl + S",
            func: exportJSON,
        },
        {
            icon: Image,
            label: "Export SVG",
            shortcut: "Ctrl + E",
            func: exportSVG,
        },
    ];
</script>

<svelte:window
    onclick={(event: Event) => {
        if (isMenuOpen) {
            event.stopPropagation();
            isMenuOpen = false;
        }
    }}
/>

<div
    class="w-full flex items-center gap-2 bg-white p-2 border-b border-gray-300"
>
    <button
        title="Menu"
        class="icon"
        class:selected={isMenuOpen}
        onclick={(event: Event) => {
            event.stopPropagation();
            isMenuOpen = !isMenuOpen;
        }}
    >
        <Menu size={16} />
    </button>
    <hr class="h-5 w-0 border-l" />
    {#each tools as tool}
        <button
            title={tool.tooltip}
            class:selected={editorMode == tool.mode}
            class="icon"
            onclick={() => (editorMode = tool.mode)}
        >
            <tool.icon size={16} />
        </button>
    {/each}
    <hr class="h-5 w-0 border-l" />
    <Zoom />
    <hr class="h-5 w-0 border-l" />
    <!-- <History /> -->
    <hr class="h-5 w-0 border-l" />
    <a
        href="https://github.com/IonutCicio/uml-editor"
        class="w-10 grid place-items-center"
    >
        <!-- <Github size={16} /> -->
    </a>
    <CircleQuestionMark size={16} />
</div>

{#if isMenuOpen}
    <div
        class="absolute left-4 top-19 bg-white rounded-md border border-gray-300 z-10 p-2"
    >
        {#each menuItems as item}
            <div>
                <button
                    onclick={item.func}
                    class="w-full flex! items-center gap-3 px-3 py-2"
                >
                    <item.icon size={16} />
                    {item.label}
                    {#if item.shortcut}
                        <code class="self-end ml-auto pl-4">
                            {item.shortcut}
                        </code>
                    {/if}
                </button>
            </div>
        {/each}
    </div>
{/if}
