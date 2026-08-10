<script lang="ts">
    import { EditorMode, graph, paper, pauseGraphToJSON } from "$lib/utils";
    import * as joint from "@joint/core";
    import { ClassResizeTool } from "../JointJS/ClassResizeTool";
    import { conf } from "$lib";

    let {
        selectedCellViews = $bindable([]),
        editorMode = $bindable(),
        mouseButton = $bindable(),
    }: {
        selectedCellViews: joint.dia.CellView[];
        editorMode: EditorMode;
        mouseButton: number;
    } = $props();

    const selectionRectangle: joint.shapes.standard.Rectangle =
        new joint.shapes.standard.Rectangle();

    selectionRectangle.attr({
        body: {
            fill: "rgba(0, 162, 255, 0.1)",
            stroke: "#00A2FF",
        },
    });

    let previousSelectedCellViews: joint.dia.CellView[] = [];

    const BOUDNARY = {
        focusOpacity: 1,
        padding: $conf.gridSize,
        useModelGeometry: true,
        attributes: {
            stroke: "black",
            "stroke-width": 0.5,
            "stroke-dasharray": "3", // 5.5
            fill: "none",
        },
    };

    $effect(() => {
        $pauseGraphToJSON = true;
        if (
            previousSelectedCellViews.length == 1 &&
            selectedCellViews.length == 1 &&
            previousSelectedCellViews[0] == selectedCellViews[0]
        ) {
            return;
        }

        for (const cellView of previousSelectedCellViews) {
            cellView.removeTools();
        }

        previousSelectedCellViews = selectedCellViews;

        for (const cellView of selectedCellViews) {
            if (selectedCellViews.length > 1) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            cellView.model instanceof joint.dia.Element
                                ? new joint.elementTools.Boundary(BOUDNARY)
                                : new joint.linkTools.Boundary(BOUDNARY),
                        ],
                    }),
                );

                continue;
            }

            if (cellView.model instanceof joint.dia.Link) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            new joint.linkTools.Vertices({
                                redundancyRemoval: true,
                                vertexAdding: true,
                                snapRadius: 10,
                                scale: 1,
                            }),
                            new joint.linkTools.Remove(),
                            new joint.linkTools.Boundary(BOUDNARY),
                            // new joint.linkTools.Segments(),
                            new joint.linkTools.SourceArrowhead(),
                            new joint.linkTools.TargetArrowhead(),
                        ],
                    }),
                );
            }

            if (cellView.model instanceof joint.dia.Element) {
                cellView.addTools(
                    new joint.dia.ToolsView({
                        tools: [
                            new joint.elementTools.Boundary(BOUDNARY),
                            new joint.elementTools.Remove(),
                            new ClassResizeTool({ selector: "body" }),
                        ],
                    }),
                );
            }
        }
        $pauseGraphToJSON = false;
    });

    paper.on("blank:pointerclick", function (event: joint.dia.Event) {
        if (event.button === 0) {
            selectedCellViews = [];
        }
    });

    paper.on(
        "blank:pointerdown",
        function (event: joint.dia.Event, x: number, y: number) {
            mouseButton = event.button || 0;

            if (editorMode !== EditorMode.Selection || mouseButton !== 0) {
                if (mouseButton === 0) {
                    selectedCellViews = [];
                }
                return;
            }

            $pauseGraphToJSON = true;
            selectionRectangle.addTo(graph);
            selectionRectangle.position(x, y);
            selectionRectangle.attr({
                body: {
                    width: 0,
                    height: 0,
                },
            });
            selectionRectangle.toFront();
        },
    );

    paper.on(
        "blank:pointermove",
        function (_event: joint.dia.Event, x: number, y: number) {
            if (editorMode !== EditorMode.Selection || mouseButton !== 0) {
                return;
            }

            const width = Math.max(x - selectionRectangle.position().x, 0);
            const height = Math.max(y - selectionRectangle.position().y, 0);

            selectionRectangle.size(width, height);
            selectionRectangle.attr({ body: { width, height } });
        },
    );

    paper.on("blank:pointerup", function () {
        if (
            editorMode !== EditorMode.Selection ||
            !graph.getCell(selectionRectangle.id)
        ) {
            return;
        }

        selectedCellViews = paper
            .findCellViewsInArea(selectionRectangle.getBBox(), {
                strict: false,
            })
            .filter((cellView) => cellView.model != selectionRectangle);

        selectionRectangle.remove();
    });

    let selectionStartPosition = { x: 0, y: 0 };
    let manualSelectionMode = false;

    paper.on("cell:pointerdown", function (cellView: joint.dia.CellView) {
        $pauseGraphToJSON = true;
        selectionStartPosition = cellView.model.position();

        if (manualSelectionMode) {
            if (selectedCellViews.includes(cellView)) {
                selectedCellViews = selectedCellViews.filter(
                    (selectedCellView) => selectedCellView !== cellView,
                );
            } else {
                selectedCellViews = [cellView, ...selectedCellViews];
            }
            return;
        }

        if (selectedCellViews.includes(cellView)) {
            return;
        }
        selectedCellViews = [cellView];
    });

    paper.on("cell:pointermove", function (cellView: joint.dia.CellView) {
        $pauseGraphToJSON = true;
        const cellPosition = cellView.model.position();
        const dx = cellPosition.x - selectionStartPosition.x;
        const dy = cellPosition.y - selectionStartPosition.y;
        selectionStartPosition = cellPosition;

        for (const selectedCellView of selectedCellViews) {
            if (
                selectedCellView === cellView ||
                !(selectedCellView.model instanceof joint.dia.Element)
            ) {
                continue;
            }

            const oldCellPosition = selectedCellView.model.position();
            selectedCellView.model.position(
                oldCellPosition.x + dx,
                oldCellPosition.y + dy,
            );
        }
    });

    paper.on("cell:pointerup", function () {
        $pauseGraphToJSON = false;
        graph.trigger("change");
    });
</script>

<svelte:window
    onkeydown={function (event: KeyboardEvent) {
        // manualSelectionMode = event.shiftKey || event.ctrlKey;
        manualSelectionMode = event.ctrlKey;

        // temporary fix, there might be a better alternative
        const target = event.target as HTMLElement;

        const isEditing: boolean =
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target.isContentEditable;

        if (isEditing) {
            return;
        }

        if (event.key == "Escape") {
            selectedCellViews = [];
        }

        if (event.key == "Backspace" || event.key == "Delete") {
            $pauseGraphToJSON = true;
            for (const cellView of selectedCellViews) {
                cellView.model.remove();
            }
            selectedCellViews = [];
            $pauseGraphToJSON = false;
            graph.trigger("change");

            return;
        }
    }}
    onkeyup={function (_event: KeyboardEvent): void {
        manualSelectionMode = false;
    }}
/>
