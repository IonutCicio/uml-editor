import type { IUMLLink } from "$lib/types/uml";
import { conf } from "$lib";
import { get } from "svelte/store";
import * as joint from "@joint/core";
import { measureText, lengthToGridEven, snapSize } from "$lib/utils";

export const JointJSAssociation = joint.dia.Link.define(
    "custom.JointJSAssociation",
    {
        ...joint.dia.Link.prototype.defaults,
        sourceMultiplicity: "0..*",
        name: "association",
        targetMultiplicity: "0..*",
        attrs: {
            line: {
                connection: true,
                stroke: "black",
                strokeWidth: 2,
                fill: "none"
            },
            wrapper: {
                connection: true,
                strokeWidth: 20
            }
        },
        labels: [
            // 0: Source Multiplicity
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
            // 1: Association Name
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
            // 2: Target Multiplicity
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
            const sourceMultiplicity = this.get("sourceMultiplicity") || "";
            const sourceLabelLength = snapSize(measureText(sourceMultiplicity), get(conf).gridSize * 2, Math.ceil)

            let sourceLabelPosition = sourceLabelLength / 2 + get(conf).gridSize / 2;
            if (
                this.get("source")?.port?.includes("port-b-") ||
                this.get("source")?.port?.includes("port-t-")
            ) {
                sourceLabelPosition = get(conf).gridSize;
            }

            this.label(0, {
                attrs: {
                    text: { text: sourceMultiplicity },
                    rect: { width: sourceLabelLength }
                },
                position: sourceLabelPosition,
            });

            // ----

            const targetMultiplicity = this.get("targetMultiplicity") || "";
            const targetLabelLength = lengthToGridEven(measureText(targetMultiplicity))

            let targetLabelPosition = (targetLabelLength / 2 + get(conf).gridSize / 2)
            if (
                this.get("target")?.port?.includes("port-b-") ||
                this.get("target")?.port?.includes("port-t-")
            ) {
                targetLabelPosition = get(conf).gridSize;
            }

            this.label(2, {
                attrs: {
                    text: { text: targetMultiplicity },
                    rect: {
                        x: - targetLabelLength / 2,
                        width: targetLabelLength
                    }
                },
                position: -1 * targetLabelPosition
            });

            // ----

            const name = this.get("name") || "";
            const nameLabelLength = snapSize(measureText(name), get(conf).gridSize * 2, Math.ceil)

            this.label(1, {
                attrs: {
                    text: { text: name },
                    rect: {
                        x: - nameLabelLength / 2,
                        width: nameLabelLength
                    }
                }
            });
        }
    }
);
