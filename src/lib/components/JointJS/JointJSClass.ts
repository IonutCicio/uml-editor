import { type IUMLClass, } from '$lib/types/uml';
import { graph, snapSize, measureText } from '$lib/utils';
import { Attribute, conf, Multiplicity, UMLClass } from '$lib';
import { get } from 'svelte/store';
import * as joint from '@joint/core';

const ERROR_ATTRS = {
    fill: 'red',
    textDecoration: "underline wavy red 1.5px",
};

const WARNING_ATTRS = {
    fill: 'red',
    textDecoration: "underline wavy red 1.5px",
};

const TEXT_ATTRS = {
    fontSize: get(conf).fontSize,
    textVerticalAnchor: "middle",
    fill: 'black'
}

export const JointJSClass = joint.dia.Element.define(
    'custom.JointJSClass',
    {
        definition: '',
        attrs: {
            body: {
                refWidth: '100%',
                refHeight: '100%',
                strokeWidth: 2,
                stroke: 'hsl(0, 0%, 0%)',
                fill: 'hsl(0, 0%, 100%)',
            },
            name: {
                refX: '50%',
                y: get(conf).gridSize,
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                style: 'font-weight: 800 !important',
                fontSize: get(conf).fontSize,
            },
            divider1: { x1: 0, x2: 'calc(w)' },
            divider2: { x1: 0, x2: 'calc(w)' }
        },
    },
    {
        markup: [],

        initialize: function(this: IUMLClass) {
            joint.dia.Element.prototype.initialize.apply(this, arguments as any);
            this.on("change:size change:attrs change:name change:attributes change:operations", this.update);
            this.update();
        },

        update: function(this: IUMLClass) {
            const umlClass = UMLClass.fromString(this.get('definition'));
            // const umlClass = umlClassResult.value;

            const attrs: Record<string, any> = {};
            const markup: joint.dia.MarkupJSON = [
                { tagName: "rect", selector: "body" },
                { tagName: "text", selector: `name` },
                { tagName: "line", selector: `divider1` },
                { tagName: "line", selector: `divider2` },
            ];

            let minWidth = this.size().width;
            let currentY = 0;

            // TODO: also change the height! if the name has more than 1 line! Like, abstract!
            attrs["name"] = { text: umlClass.name.value };

            minWidth = Math.max(minWidth, measureText(umlClass.name.value) + get(conf).gridSize)
            currentY += get(conf).gridSize * 2;

            attrs["divider1"] = {
                y1: currentY,
                y2: currentY,
                stroke: this.attr('body/stroke'),
                visibility:
                    (
                        (umlClass.attributes.length > 0 || umlClass.operations.length > 0) ||
                        (umlClass.attributes.length === 0 && umlClass.operations.length === 0)
                    ) ? "visible" : "hidden",
            };

            if (umlClass.attributes.length === 0 && umlClass.operations.length === 0) {
                currentY += get(conf).gridSize * 2;
            }

            umlClass.attributes.forEach((attribute, index) => {
                minWidth = Math.max(minWidth, measureText(attribute.toString()) + get(conf).gridSize);

                const lineAttrs = { y: currentY + get(conf).gridSize, ...TEXT_ATTRS };

                attrs[`attribute-${index}`] = { x: get(conf).gridSize / 2, ...lineAttrs };

                const newAttrs: Record<string, any> = {};

                if (attribute instanceof Attribute) {
                    newAttrs[`attribute-name-${index}`] = { text: `${attribute.name.value}: `, ...lineAttrs }; // TODO: handle errors / warnings;
                    newAttrs[`attribute-type-${index}`] = { text: attribute.type.value, fontWeight: 400, ...lineAttrs }; // TODO: handle errors;

                    const multiplicityString = (
                        attribute.multiplicity instanceof Multiplicity ?
                            attribute.multiplicity :
                            attribute.multiplicity.value
                    ).toString();

                    if (multiplicityString) {
                        newAttrs[`attribute-multiplicity-${index}`] = { text: ` ${multiplicityString}`, ...lineAttrs };
                    }

                    const identifierString = "";
                    // const identifierString = attribute.identifiers ? attribute.identifiers.value.toString() : "";
                    if (identifierString) {
                        newAttrs[`attribute-id-${index}`] = { text: ` ${identifierString}`, fontStyle: "italic", ...lineAttrs };
                    }
                    // console.log(attribute.identifiers)
                } else {
                    newAttrs[`attribute-text-${index}`] = { text: attribute, ...lineAttrs, ...ERROR_ATTRS };
                }

                Object.assign(attrs, newAttrs);

                markup.push({
                    tagName: "text",
                    selector: `attribute-${index}`,
                    children: Object.keys(newAttrs)
                        .map((selector) => ({ tagName: "tspan", selector }))
                });

                currentY += get(conf).gridSize * 2;
            });

            attrs["divider2"] = {
                stroke: this.attr('body/stroke'),
                y1: currentY,
                y2: currentY,
                visibility: umlClass.attributes.length > 0 && umlClass.operations.length > 0 ? "visible" : "hidden",
            };

            umlClass.operations.forEach((op, index) => {
                const text = op.toString();
                minWidth = Math.max(minWidth, measureText(text) + get(conf).gridSize);

                // TODO: make it more detailed, for [ ] too, and for () and for : (like operations and like that)
                // TODO: handle each parameter
                attrs[`operation-${index} `] = {
                    text: text,
                    x: get(conf).gridSize / 2,
                    y: currentY + get(conf).gridSize,
                    textAnchor: "left",
                    textVerticalAnchor: "middle",
                    fontSize: get(conf).fontSize,
                };
                attrs[`operation-name-${index}`] = {}
                attrs[`operation-type-${index}`] = {}
                attrs[`operation-multiplicity-${index}`] = {}
                markup.push({
                    tagName: "text",
                    selector: `operation-${index}`,
                    children: [
                        { tagName: "tspan", selector: `operation-name-${index}` },
                        { tagName: "tspan", selector: `operation-type-${index}` },
                        { tagName: "tspan", selector: `operation-multiplicity-${index}` }
                    ]
                });

                currentY += get(conf).gridSize * 2;
            });


            // TODO: get the anchors attached to this object, and take the minium of those heights / widths (dy, dx)...

            this.resize(
                snapSize(minWidth, get(conf).gridSize * 2, Math.ceil),
                snapSize(Math.max(currentY, this.size().height), get(conf).gridSize * 2, Math.ceil)
            );
            this.attr(attrs);
            this.set('markup', markup)
        }
    }
);

// let markupChildrenSelectors: string[] = [];
// markupChildrenSelectors.push(`attribute-text-${index}`);

// console.log("BEFORE", Object.keys(attrs));
// const previousAttrsLength = Object.keys(attrs).length;

// markup.push({
//     tagName: "text",
//     selector: `attribute-${index}`,
//     children: [
//         { tagName: "tspan", selector: `attribute-text-${index}` },
//     ]
// });
//
// currentY += get(conf).gridSize * 2;
// return

// children: [
//     { tagName: "tspan", selector: `attribute-name-${index}` },
//     { tagName: "tspan", selector: `attribute-type-${index}` },
//     { tagName: "tspan", selector: `attribute-multiplicity-${index}` },
//     { tagName: "tspan", selector: `attribute-id-${index}` }
// ]


// stroke: 'black',
// fill: 'white',

// stroke: 'hsl(0, 0%, 0%)',
// fill: 'hsl(0, 0%, 100%)',

// ports: {
//     items: []
// }


// { silent: true }
// this.set('ports', { items: getPerimeterPorts(width, height, this.id) })
// for (const port of this.getPorts()) {
//     if (graph.getLinks().some((linkView) => {
//         return linkView.get("source").port == port.id ||
//             linkView.get("target").port == port.id
//     })) {
//
//         if (port.type == "t" || port.type == "b") {
//             width = Math.max(
//                 width,
//                 lengthToGridEven(port.args?.x as number)
//             )
//         }
//
//         if (port.type == "l" || port.type == "r") {
//             height = Math.max(
//                 height,
//                 lengthToGridEven(port.args?.y as number)
//             )
//         }
//     }
// }

// content: '',
// name: 'Class',
// attributes: [],
// operations: [],
