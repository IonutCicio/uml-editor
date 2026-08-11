import type { IUMLLink } from "$lib/types/uml";
import { conf } from "$lib";
import { get } from "svelte/store";
import * as joint from "@joint/core";
import { measureText, lengthToGridEven, snapSize } from "$lib/utils";

export const JointJSAssociation = joint.dia.Link.define(
    "custom.JointJSAssociation",
    {
        ...joint.dia.Link.prototype.defaults,
        // TODO: rename "Multiplicity" to "role" and add the following things: 
        // - multiplicity
        // - name
        // - identifiers list
        sourceMultiplicity: "0..*",
        name: "",
        targetMultiplicity: "0..*",
        attrs: {
            line: {
                connection: true,
                stroke: "black",
                strokeWidth: 1,
                fill: "none"
            },
            wrapper: {
                connection: true,
                strokeWidth: 20
            }
        },
        labels: [
            {
                attrs: {
                    text: { "font-size": get(conf).fontSize },
                    rect: {
                        fill: "white",
                        stroke: "white",
                        strokeWidth: get(conf).gridSize / 3
                    },
                }
            },
            {
                position: 0.5,
                attrs: {
                    text: {
                        "font-size": get(conf).fontSize,
                        "font-style": "italic"
                    },
                    rect: {
                        fill: "white",
                        stroke: "white",
                    }
                }
            },
            {
                attrs: {
                    text: { "font-size": get(conf).fontSize },
                    rect: {
                        fill: "white",
                        stroke: "white",
                        strokeWidth: get(conf).gridSize / 3
                    },
                }
            }
        ]
    },
    {
        markup: [
            {
                tagName: "path",
                selector: "wrapper",
                attributes: {
                    "fill": "none",
                    "cursor": "pointer",
                    "stroke": "transparent"
                }
            },
            {
                tagName: "path",
                selector: "line",
                attributes: {
                    "fill": "none",
                    "pointer-events": "none"
                }
            },
        ],

        initialize: function(this: IUMLLink) {
            joint.dia.Link.prototype.initialize.apply(this, arguments as any);
            this.on("change:sourceMultiplicity change:name change:targetMultiplicity", this.update);
            this.update();
        },

        update: function(this: IUMLLink) {
            const router = this.router();

            const sourceMultiplicity = this.get("sourceMultiplicity");
            const sourceLabelLength = snapSize(measureText(sourceMultiplicity), get(conf).gridSize * 2, Math.ceil)

            let sourceLabelPosition = 1;
            const sourceDirection = router?.args.startDirections[0];
            if (sourceDirection === "top") {
                sourceLabelPosition = get(conf).gridSize * 1;
            } else if (sourceDirection === "bottom") {
                sourceLabelPosition = get(conf).gridSize * 1;
            } else if (sourceDirection === "left") {
                sourceLabelPosition = get(conf).gridSize * 1.5;
            } else if (sourceDirection === "right") {
                sourceLabelPosition = get(conf).gridSize * 1.5;
            }

            this.label(0, {
                attrs: {
                    text: { text: sourceMultiplicity },
                    rect: {
                        width: sourceLabelLength,
                        fill: "white",
                        stroke: "white",
                    }
                },
                position: sourceLabelPosition,
            });

            // ----

            const targetMultiplicity = this.get("targetMultiplicity");
            const targetLabelLength = lengthToGridEven(measureText(targetMultiplicity))

            let targetLabelPosition = 1;
            const targetDirection = router?.args.endDirections[0];
            if (targetDirection === "top") {
                targetLabelPosition = get(conf).gridSize * 1;
            } else if (targetDirection === "bottom") {
                targetLabelPosition = get(conf).gridSize * 1;
            } else if (targetDirection === "left") {
                targetLabelPosition = get(conf).gridSize * 1.5;
            } else if (targetDirection === "right") {
                targetLabelPosition = get(conf).gridSize * 1.5;
            }

            this.label(2, {
                attrs: {
                    text: { text: targetMultiplicity },
                    rect: {
                        x: - targetLabelLength / 2,
                        width: targetLabelLength,
                        fill: "white",
                        stroke: "white",
                    }
                },
                position: -1 * targetLabelPosition
            });

            // ----

            const name = this.get("name");
            const nameLabelLength = snapSize(measureText(name), get(conf).gridSize * 2, Math.ceil)

            this.label(1, {
                attrs: {
                    text: { text: name },
                    rect: {
                        x: - nameLabelLength / 2,
                        width: nameLabelLength,
                    }
                }
            });
        }
    }
);
