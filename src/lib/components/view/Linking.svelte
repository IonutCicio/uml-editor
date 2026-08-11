<script lang="ts">
    import * as joint from "@joint/core";
    import { graph, paper, snapSizeToClosest } from "$lib/utils";
    import { JointJSAssociation } from "../JointJS/JointJSAssociation";
    import { JointJSClass } from "../JointJS/JointJSClass";
    import { conf } from "$lib";
    import { get } from "svelte/store";

    let isInLinkingState: boolean = false;
    let tempPedingSource: any = null;
    let pendingSource: any = null;
    let tempLink: joint.shapes.standard.Link | null = null;

    function getClosestClass(x: number, y: number): joint.dia.Element | null {
        const point = new joint.g.Point(x, y);

        let closestElement = null;
        let minDistance = Infinity;

        graph
            .getElements()
            .filter((el) => el instanceof JointJSClass)
            .forEach((el) => {
                const distance = point.distance(
                    el.getBBox().pointNearestToPoint(point),
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestElement = el;
                }
            });

        return closestElement;
    }

    // TODO: use undefined
    let mouseFunc = function (event: MouseEvent): void {
        if (!isInLinkingState) {
            return;
        }

        if (tempLink) {
            tempLink.remove();
            tempLink = null;
        }

        let mouseLocalPoint = paper.clientToLocalPoint({
            x: event.clientX || 0,
            y: event.clientY || 0,
        });

        let localPoint = paper.clientToLocalPoint({
            x: event.clientX || 0,
            y: event.clientY || 0,
        });

        const closestObj = getClosestClass(localPoint.x, localPoint.y);

        if (!closestObj) {
            return;
        }

        const objectCell = graph.getCell(closestObj);

        let x1 = objectCell.getBBox().x;
        let y1 = objectCell.getBBox().y;
        let width1 = objectCell.getBBox().width;
        let height1 = objectCell.getBBox().height;

        let points = [];
        for (let x = x1; x <= x1 + width1; x += get(conf).gridSize) {
            points.push([x, y1]);
            points.push([x, y1 + height1]);
        }

        for (
            let y = y1 + get(conf).gridSize;
            y < y1 + height1;
            y += get(conf).gridSize
        ) {
            points.push([x1, y]);
            points.push([x1 + width1, y]);
        }

        function distance(
            x1: number,
            y1: number,
            x2: number,
            y2: number,
        ): number {
            return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }

        let [closestX, closestY] = points.reduce(([minX, minY], [x, y]) =>
            distance(minX, minY, mouseLocalPoint.x, mouseLocalPoint.y) <
            distance(x, y, mouseLocalPoint.x, mouseLocalPoint.y)
                ? [minX, minY]
                : [x, y],
        );

        let dx: number | string = closestX - x1;
        let dy: number | string = closestY - y1;
        let direction = "top";

        if (closestX === x1) {
            direction = "left";
            dx = "0%";
        } else if (closestX === x1 + width1) {
            direction = "right";
            dx = "100%";
        } else if (closestY === y1) {
            direction = "top";
            dy = "0%";
        } else if (closestY === y1 + height1) {
            direction = "bottom";
            dy = "100%";
        }

        tempPedingSource = {
            id: closestObj.id,
            direction,
            dx,
            dy,
        };

        let endDirection = "top";
        if (tempPedingSource.direction === "top") {
            endDirection = "bottom";
        } else if (tempPedingSource.direction === "bottom") {
            endDirection = "top";
        } else if (tempPedingSource.direction === "left") {
            endDirection = "right";
        } else if (tempPedingSource.direction === "right") {
            endDirection = "left";
        }

        tempLink = new joint.shapes.standard.Link({
            // tempLink = new JointJSAssociation({
            source: {
                id: pendingSource ? pendingSource.id : tempPedingSource.id,
                anchor: {
                    name: "topLeft",
                    args: pendingSource
                        ? { dx: pendingSource.dx, dy: pendingSource.dy }
                        : { dx: tempPedingSource.dx, dy: tempPedingSource.dy },
                },
            },
            target: pendingSource
                ? {
                      id: tempPedingSource.id,
                      anchor: {
                          name: "topLeft",
                          args: {
                              dx: tempPedingSource.dx,
                              dy: tempPedingSource.dy,
                          },
                      },
                  }
                : {
                      x: snapSizeToClosest(mouseLocalPoint.x),
                      y: snapSizeToClosest(mouseLocalPoint.y),
                  },
            router: {
                name: "manhattan",
                args: {
                    startDirections: [
                        pendingSource
                            ? pendingSource.direction
                            : tempPedingSource.direction,
                    ],
                    endDirections: pendingSource
                        ? [tempPedingSource.direction]
                        : [endDirection],
                },
            },
            attrs: {
                root: {
                    pointerEvents: "none",
                },
                line: {
                    connection: true,
                    stroke: "black",
                    strokeWidth: 1,
                    fill: "none",
                    sourceMarker: null,
                    targetMarker: null,
                },
                wrapper: {
                    connection: true,
                    strokeWidth: 20,
                },
            },
        });

        tempLink.addTo(graph);
    };

    paper.on(
        "blank:pointerdown",
        function (event: joint.dia.Event, x: number, y: number): void {
            if (!isInLinkingState) {
                return;
            }

            if (!pendingSource) {
                pendingSource = tempPedingSource;
                return;
            }

            const link = new JointJSAssociation({
                source: {
                    id: pendingSource.id,
                    anchor: {
                        name: "topLeft",
                        args: { dx: pendingSource.dx, dy: pendingSource.dy },
                    },
                },
                target: {
                    id: tempPedingSource.id,
                    anchor: {
                        name: "topLeft",
                        args: {
                            dx: tempPedingSource.dx,
                            dy: tempPedingSource.dy,
                        },
                    },
                },
                router: {
                    name: "manhattan",
                    args: {
                        startDirections: [pendingSource.direction],
                        endDirections: [tempPedingSource.direction],
                    },
                },
            });

            link.addTo(graph);
            // TODO: otherwise, just create a link!
        },
    );
</script>

<svelte:window
    onkeydown={function (event: KeyboardEvent): void {
        if (event.key == "Escape") {
            if (tempLink) {
                tempLink.remove();
                tempLink = null;
            }

            return;
        }

        if (
            event.target instanceof HTMLElement &&
            (event.target.tagName === "INPUT" ||
                event.target.tagName === "TEXTAREA" ||
                event.target.isContentEditable)
        ) {
            return;
        }

        isInLinkingState = event.shiftKey;
    }}
    onkeyup={function (_event: KeyboardEvent): void {
        isInLinkingState = false;
        if (tempLink) {
            tempLink.remove();
            tempLink = null;
            pendingSource = null;
            tempPedingSource = null;
        }
    }}
    onmousemove={mouseFunc}
/>
