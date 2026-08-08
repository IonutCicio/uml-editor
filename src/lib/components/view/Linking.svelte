<script>
    // State to hold the source element details during the two-step click process
    let pendingSource: any = null;
    let tempLink: any = null;

    function handleMouseMove(evt) {
        if (!tempLink) return;
        // Convert browser client coordinates to paper coordinates
        const p = paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
        tempLink.target({ x: lengthToGrid(p.x), y: lengthToGrid(p.y) });
    }

    // Prevent default context menu globally on the paper container if needed
    paper.el.addEventListener("contextmenu", (evt) => evt.preventDefault());

    // Listen for right-clicks on elements
    paper.on("element:contextmenu", function (elementView, evt, x, y) {
        evt.preventDefault();

        // TODO: WHY NOT LOOK FOR THE CLOSEST OBJECT? Like, the closest point to the closest object????
        const element = elementView.model;
        const bbox = element.getBBox();

        const dTop = Math.abs(y - bbox.y);
        const dBottom = Math.abs(bbox.y + bbox.height - y);
        const dLeft = Math.abs(x - bbox.x);
        const dRight = Math.abs(bbox.x + bbox.width - x);

        const min = Math.min(dTop, dBottom, dLeft, dRight);

        let dx = Math.min(bbox.width, Math.max(lengthToGrid(x) - bbox.x, 0));
        let dy = Math.min(bbox.height, Math.max(lengthToGrid(y) - bbox.y, 0));

        if (dTop == min) {
            dy = 0;
        } else if (dBottom == min) {
            dy = bbox.height;
        } else if (dLeft == min) {
            dx = 0;
        } else {
            dx = bbox.width;
        }

        if (!pendingSource) {
            pendingSource = {
                id: element.id,
                dx: dx,
                dy: dy,
            };

            console.log("x, y", x, y);
            console.log("~x, ~y", lengthToGrid(x), lengthToGrid(y));
            tempLink = new joint.shapes.standard.Link({
                source: {
                    id: pendingSource.id,
                    anchor: {
                        name: "topLeft",
                        args: { dx: pendingSource.dx, dy: pendingSource.dy },
                    },
                },
                target: { x: lengthToGrid(x), y: lengthToGrid(y) },
                attrs: {
                    root: {
                        pointerEvents: "none",
                    },
                },
            });

            tempLink.addTo(graph);
            document.addEventListener("mousemove", handleMouseMove);
            elementView.highlight();
        } else {
            const targetDx = dx;
            const targetDy = dy;

            document.removeEventListener("mousemove", handleMouseMove);
            if (tempLink) {
                tempLink.remove();
                tempLink = null;
            }

            const sourceView = paper.findViewByModel(pendingSource.id);
            if (sourceView) sourceView.unhighlight();

            const link = new JointJSAssociation({
                source: {
                    id: pendingSource.id,
                    anchor: {
                        name: "topLeft",
                        args: { dx: pendingSource.dx, dy: pendingSource.dy },
                    },
                },
                target: {
                    id: element.id,
                    anchor: {
                        name: "topLeft",
                        args: { dx: targetDx, dy: targetDy },
                    },
                },
            });

            link.addTo(graph);

            pendingSource = null;
        }
    });

    paper.on("blank:contextmenu", function (evt) {
        evt.preventDefault();
        if (pendingSource) {
            const sourceView = paper.findViewByModel(pendingSource.id);
            if (sourceView) sourceView.unhighlight();
            pendingSource = null;
        }
    });
</script>
