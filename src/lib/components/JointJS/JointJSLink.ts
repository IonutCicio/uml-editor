//
import type { IUMLLink } from "$lib/types/uml";
import { conf } from "$lib";
import { get } from "svelte/store";
import * as joint from "@joint/core";
import { lengthToGridEven, computeTextLength } from "$lib/utils";

export const JointJSLink = joint.dia.Link.define(
    "custom.JointJSLink",
    {
        ...joint.dia.Link.prototype.defaults,
        attrs: {
            name: "link",
            line: {
                connection: true,
                stroke: "black",
                "stroke-dasharray": "3", // 5.5
                strokeWidth: 2,
                fill: "none"
            },
            wrapper: {
                connection: true,
                strokeWidth: 20
            }
        },
        labels: [
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
            this.on("change:name", this.update);
            this.update();
        },

        update: function(this: IUMLLink) {
            const name = this.get("name") || "link";
            const nameLabelLength = lengthToGridEven(computeTextLength(name));

            this.label(0, {
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
