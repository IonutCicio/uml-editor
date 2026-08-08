<script lang="ts">
    import * as joint from "@joint/core";
    import {
        EditorMode,
        paper,
        graph,
        exportJSON,
        exportSVG,
        importJSON,
        clickOutside,
    } from "$lib/utils";
    import { JointJSClass } from "./JointJS/JointJSClass";
    import Toolbar from "./view/Toolbar.svelte";
    import { JointJSNote } from "./JointJS/JointJSNote";
    import { JointJSAssociation } from "./JointJS/JointJSAssociation";
    import Selection from "./view/Selection.svelte";
    import Panning from "./view/Panning.svelte";
    import ClassInspector from "./view/ClassInspector.svelte";
    import AssociationInspector from "./view/AssociationInspector.svelte";
    import { onMount } from "svelte";
    import { JointJSActor } from "./JointJS/JointJSActor";
    import { JointJSUseCase } from "./JointJS/JointJSUseCase";
    import { JointJSObject } from "./JointJS/JointJSObject";

    let paperElement: HTMLElement;

    let mouseButton: number = $state(0);
    let localMousePoint: joint.g.Point = new joint.g.Point(0, 0);

    let editorMode: EditorMode = $state(EditorMode.Panning);

    let copiedViews: joint.dia.CellView[] = [];
    let selectedCellViews: joint.dia.CellView[] = $state([]);
    let inspectedCellView: joint.dia.CellView | null = $state(null);

    onMount(() => {
        paper.setElement(paperElement);
        paper.setDimensions(
            paperElement.clientWidth,
            paperElement.clientHeight,
        );
        paper.render();

        const storedDiagramJSON: string | null =
            localStorage.getItem("diagram");
        if (storedDiagramJSON) {
            graph.fromJSON(JSON.parse(storedDiagramJSON));
        }
    });

    function handleKeydown(event: KeyboardEvent) {
        if (event.ctrlKey || event.metaKey) {
            if (event.key.toLowerCase() === "s") {
                event.preventDefault();
                exportJSON();
            }

            if (event.key.toLowerCase() === "e") {
                event.preventDefault();
                exportSVG();
            }

            if (event.key.toLowerCase() === "i") {
                event.preventDefault();
                importJSON();
            }

            // Copy
            // TODO: add "copy to clipboard", maybe. Could be useful to copy from one diagram to another.
            if (event.key.toLowerCase() === "c") {
                copiedViews = selectedCellViews;
            }

            // Paste
            if (event.key.toLowerCase() === "v" && copiedViews.length > 0) {
                let leftmostUppermostPosition: joint.g.Point =
                    copiedViews[0].model.position();

                for (const cellView of copiedViews) {
                    const position = cellView.model.position();
                    if (position.x <= leftmostUppermostPosition.x) {
                        leftmostUppermostPosition.x = position.x;
                    }

                    if (position.y <= leftmostUppermostPosition.y) {
                        leftmostUppermostPosition.y = position.y;
                    }
                }

                for (const cellView of copiedViews) {
                    const oldPosition = cellView.model.position();
                    const newModel = cellView.model.clone();
                    newModel.addTo(graph);
                    const newCellView = paper.findViewByModel(newModel);
                    newCellView.model.position(
                        oldPosition.x +
                            localMousePoint.x -
                            leftmostUppermostPosition.x,
                        oldPosition.y +
                            localMousePoint.y -
                            leftmostUppermostPosition.y,
                    );
                }
            }
        }

        if (event.key == "Escape") {
            inspectedCellView = null;
        }

        if (
            event.target instanceof HTMLElement &&
            (event.target.tagName.toLowerCase() == "input" ||
                event.target.tagName.toLowerCase() == "textarea")
        ) {
            return;
        }

        editorMode =
            {
                "1": EditorMode.Panning,
                "2": EditorMode.Selection,
                "3": EditorMode.DashedLine,
                "4": EditorMode.Generalization,
                "5": EditorMode.Object,
                "6": EditorMode.Link,
                "7": EditorMode.InstanceOf,
                "8": EditorMode.Actor,
                "9": EditorMode.UseCase,
                "0": EditorMode.Note,
            }[event.key] || editorMode;
    }

    paper.on("cell:pointerdblclick", function (cellView: joint.dia.CellView) {
        inspectedCellView = cellView;
    });

    paper.on(
        "blank:pointerdblclick",
        function (event: joint.dia.Event, x: number, y: number) {
            event.preventDefault();
            let obj;

            if (editorMode === EditorMode.Object) {
                obj = new JointJSObject();
            } else if (editorMode === EditorMode.Actor) {
                obj = new JointJSActor();
            } else if (editorMode === EditorMode.UseCase) {
                obj = new JointJSUseCase();
            } else if (editorMode === EditorMode.Note) {
                obj = new JointJSNote();
            } else {
                obj = new JointJSClass();
            }

            obj.position(x, y);
            obj.addTo(graph);
            selectedCellViews = [paper.findViewByModel(obj)];
            return;
        },
    );
</script>

<svelte:window
    onresize={() =>
        paper.setDimensions(window.innerWidth, paperElement.clientHeight)}
    onkeydown={handleKeydown}
    onpointermove={(event: MouseEvent) => {
        localMousePoint = paper.clientToLocalPoint(
            event.clientX,
            event.clientY,
        );
    }}
/>

<Selection bind:selectedCellViews bind:editorMode bind:mouseButton />
<Panning bind:editorMode bind:mouseButton />

<div class="relative flex flex-col w-full h-screen overflow-hidden">
    <Toolbar bind:editorMode />

    <div class="relative w-full h-full">
        <div id="paper" class="w-full h-full" bind:this={paperElement}></div>
    </div>
</div>

{#if inspectedCellView !== null}
    <div
        class="absolute top-0 left-0 w-full h-full bg-black/20 grid place-items-center"
        role="dialog"
        tabindex="0"
    >
        <div
            class="bg-white rounded-md p-4"
            use:clickOutside={(e) => (inspectedCellView = null)}
        >
            {#if inspectedCellView.model instanceof JointJSClass}
                <ClassInspector component={inspectedCellView.model} />
            {:else if inspectedCellView.model instanceof JointJSAssociation}
                <AssociationInspector component={inspectedCellView.model} />
            {/if}
        </div>
    </div>
{/if}

<!-- // if (event.key === "1") { -->
<!-- //     editorMode = EditorMode.Panning; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "2") { -->
<!-- //     editorMode = EditorMode.Selection; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "3") { -->
<!-- //     editorMode = EditorMode.DashedLine; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "4") { -->
<!-- //     editorMode = EditorMode.Generalization; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "5") { -->
<!-- //     editorMode = EditorMode.Object; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "6") { -->
<!-- //     editorMode = EditorMode.Link; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "7") { -->
<!-- //     editorMode = EditorMode.InstanceOf; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "8") { -->
<!-- //     editorMode = EditorMode.Actor; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "9") { -->
<!-- //     editorMode = EditorMode.UseCase; -->
<!-- // } -->
<!-- // -->
<!-- // if (event.key === "0") { -->
<!-- //     editorMode = EditorMode.Note; -->
<!-- // } -->

<!-- import PropertyInspector from "$lib/components/view/PropertyInspector.svelte"; -->
<!-- import { JointJSInstanceOf } from "./JointJS/JointJSInstanceOf"; -->
<!-- import { JointJSDashedLine } from "./JointJS/JointJSDashedLine"; -->
<!-- import { JointJSGeneralization } from "./JointJS/JointJSGeneralization"; -->

<!-- // paper.options.defaultLink = function ( -->
<!-- //     _cellView: joint.dia.CellView, -->
<!-- //     _magnet: SVGElement, -->
<!-- // ) { -->
<!-- //     if (editorMode === EditorMode.DashedLine) { -->
<!-- //         return new JointJSDashedLine(); -->
<!-- //     } -->
<!-- // -->
<!-- //     if (editorMode === EditorMode.Generalization) { -->
<!-- //         return new JointJSGeneralization(); -->
<!-- //     } -->
<!-- // -->
<!-- //     if (editorMode === EditorMode.Link) { -->
<!-- //         // ... -->
<!-- //     } -->
<!-- // -->
<!-- //     if (editorMode === EditorMode.InstanceOf) { -->
<!-- //         return new JointJSInstanceOf(); -->
<!-- //     } -->
<!-- // -->
<!-- //     return new JointJSAssociation(); -->
<!-- // }; -->
<!---->
<!-- // paper.options.validateConnection = function ( -->
<!-- //     cellViewS, -->
<!-- //     magnetS, -->
<!-- //     cellViewT, -->
<!-- //     magnetT, -->
<!-- //     _end, -->
<!-- //     linkView, -->
<!-- // ) { -->
<!-- //     // if ( -->
<!-- //     //     !( -->
<!-- //     //         linkView.model instanceof JointJSGeneralization || -->
<!-- //     //         linkView.model instanceof JointJSAssociation -->
<!-- //     //     ) -->
<!-- //     // ) { -->
<!-- //     //     return false; -->
<!-- //     // } -->
<!-- // -->
<!-- //     if (!magnetT || !magnetS) { -->
<!-- //         return false; -->
<!-- //     } -->
<!-- // -->
<!-- //     const portT = magnetT.getAttribute("port"); -->
<!-- //     const portS = magnetS.getAttribute("port"); -->
<!-- // -->
<!-- //     const arePortsOccupied = graph.getLinks().some((link) => { -->
<!-- //         if (link.id == linkView.model.id) { -->
<!-- //             return false; -->
<!-- //         } -->
<!-- // -->
<!-- //         return ( -->
<!-- //             (link instanceof JointJSAssociation && -->
<!-- //                 (link.get("target").port == portT || -->
<!-- //                     link.get("target").port == portS)) || -->
<!-- //             link.get("source").port == portT || -->
<!-- //             link.get("source").port == portS -->
<!-- //         ); -->
<!-- //     }); -->
<!-- // -->
<!-- //     if (arePortsOccupied) { -->
<!-- //         return false; -->
<!-- //     } -->
<!-- // -->
<!-- //     return ( -->
<!-- //         magnetT?.getAttribute("port") != null && -->
<!-- //         // `false` is here for formatting reasons -->
<!-- //         (false || -->
<!-- //             (linkView.model instanceof JointJSAssociation && -->
<!-- //                 cellViewS.model instanceof JointJSClass && -->
<!-- //                 cellViewT.model instanceof JointJSClass) || -->
<!-- //             (linkView.model instanceof JointJSGeneralization && -->
<!-- //                 cellViewS.model instanceof JointJSClass && -->
<!-- //                 cellViewT.model instanceof JointJSClass) || -->
<!-- //             // TODO: better validation (NOTE - - - - CLASS) -->
<!-- //             // TODO: better validation (ASSOCIATION - - - - ASSOCIATION-CLASS) -->
<!-- //             (linkView.model instanceof JointJSDashedLine && -->
<!-- //                 cellViewS.model instanceof JointJSClass && -->
<!-- //                 cellViewT.model instanceof JointJSClass) || -->
<!-- //             false) -->
<!-- //     ); -->
<!-- // }; -->

<!-- // paper.on( -->
<!-- //     "blank:pointerdown", -->
<!-- //     function (event: joint.dia.Event, x: number, y: number) { -->
<!-- //         if (editorMode === EditorMode.Class) { -->
<!-- //             event.preventDefault(); -->
<!-- //             const obj = new JointJSClass(); -->
<!-- //             obj.position(x, y); -->
<!-- //             obj.addTo(graph); -->
<!-- //             selectedCellViews = [paper.findViewByModel(obj)]; -->
<!-- //             return; -->
<!-- //         } -->
<!-- // -->
<!-- // -->
<!-- //         selectedCellViews = []; -->
<!-- //     }, -->
<!-- // ); -->
<!---->
<!---->
<!-- // if (editorMode === EditorMode.Class) { -->
<!-- // } -->
<!---->
<!-- // if (editorMode === EditorMode.Note) { -->
<!-- //     event.preventDefault(); -->
<!-- //     const obj = new JointJSNote(); -->
<!-- //     obj.position(x, y); -->
<!-- //     obj.addTo(graph); -->
<!-- //     selectedCellViews = [paper.findViewByModel(obj)]; -->
<!-- //     return; -->
<!-- // } -->
<!---->
<!-- // selectedCellViews = []; -->
<!---->

<!-- <div -->
<!--     class="absolute top-0 left-0 w-min h-full bg-white border-r border-gray-300" -->
<!-- > -->
<!--     <PropertyInspector cellViews={selectedCellViews} /> -->
<!-- </div> -->

<!-- // graph.getElements().forEach((cell) => { -->
<!-- //     if (cell instanceof JointJSClass) { -->
<!-- //         cell.update(); -->
<!-- //     } -->
<!-- // }); -->
<!-- // paper.options.validateMagnet = function ( -->
<!-- //     _cellView: joint.dia.CellView, -->
<!-- //     _magnet: SVGElement, -->
<!-- // ) { -->
<!-- //     return ( -->
<!-- //         editorMode !== oditorMode.Class && editorMode !== EditorMode.Note -->
<!-- //     ); -->
<!-- // }; -->
