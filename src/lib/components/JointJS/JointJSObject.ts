import { type IUMLObject, type UMLAttribute, type UMLOperation } from '$lib/types/uml';
import { graph, lengthToGridEven, measureText } from '$lib/utils';
import { conf } from '$lib';
import { get } from 'svelte/store';
import * as joint from '@joint/core';

function operationToString(operation: UMLOperation): string {
    const paramsStr = operation.parameters
        ?.map((param) => `${param.name}: ${param.type} `)
        .join(", ");

    const paramsPart = paramsStr ? `(${paramsStr})` : "()";

    let result = `${operation.name}${paramsPart} `;

    if (operation.type) {
        result += `: ${operation.type} `;
    }

    return result.trim();
}

function getPerimeterPorts(width: number, height: number, id: joint.dia.Cell.ID) {
    let ports = []

    let portSerialId = 0
    for (let x = 0; x <= width; x += get(conf).gridSize) {
        portSerialId++;
        ports.push({ id: `${id}-port-t-${portSerialId} `, args: { x, y: 0 }, type: 't' })
        ports.push({ id: `${id}-port-b-${portSerialId} `, args: { x, y: height }, type: 'b' })
    }

    portSerialId = 0;
    for (let y = get(conf).gridSize; y < height; y += get(conf).gridSize) {
        portSerialId++;
        ports.push({ id: `${id}-port-l-${portSerialId} `, args: { x: 0, y }, type: 'l' })
        ports.push({ id: `${id}-port-r-${portSerialId} `, args: { x: width, y }, type: 'r' })
    }

    return ports;
}

export const JointJSObject = joint.dia.Element.define(
    'custom.JointJSObject',
    {
        name: 'Object',
        attributes: [],
        operations: [],
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
                style: 'font-weight: 400 !important',
                fontSize: get(conf).fontSize,
            },
            divider1: {
                x1: 0, x2: 'calc(w)', y1: get(conf).gridSize * 2, y2: get(conf).gridSize * 2,
                stroke: 'black',
                strokeWidth: 1,
            },
            divider2: {
                x1: 0,
                x2: 'calc(w)',
                stroke: 'black',
                strokeWidth: 1,
            }
        },
        ports: {
            items: []
        }
    },
    {
        markup: [],

        initialize: function(this: IUMLObject) {
            joint.dia.Element.prototype.initialize.apply(this, arguments as any);
            this.on("change:size change:attrs change:name change:attributes change:operations", this.update);
            // this.on("all", this.update);
            this.update();
        },

        update: function(this: IUMLObject) {
            const name = this.get("name");
            const attributes: UMLAttribute[] = this.get("attributes");
            const operations = this.get("operations");

            const attrs: Record<string, any> = {};
            const markup: string | joint.dia.MarkupJSON = [
                { tagName: "rect", selector: "body" },
                { tagName: "text", selector: `name` },
                { tagName: "line", selector: `divider1` },
                { tagName: "line", selector: `divider2` },
            ];

            attrs["name"] = { text: name };

            const bodyStroke = this.attr('body/stroke');

            attrs["divider1"] = {
                stroke: bodyStroke,
                visibility:
                    attributes.length > 0 || operations.length > 0 ? "visible" : "hidden",
            };

            let width = lengthToGridEven(measureText(name) + get(conf).gridSize)
            let y = get(conf).gridSize * 2; // divider1

            attributes.forEach((attribute, index) => {
                const multiplicityString = attribute.multiplicityLower === attribute.multiplicityUpper && attribute.multiplicityLower == 1 ? "" : ` [${attribute.multiplicityLower}..${attribute.multiplicityUpper}]`
                const identifierString = attribute.identifierEnabled ? ` {id${attribute.identifierNumber ? attribute.identifierNumber : ""}}` : "";

                width = Math.max(width, lengthToGridEven(measureText(`${attribute.name}: ${attribute.type}${multiplicityString}${identifierString}`) + get(conf).gridSize));

                const text = {
                    y: y + get(conf).gridSize,
                    fontSize: get(conf).fontSize,
                    textVerticalAnchor: "middle",
                    fill: 'black'
                }

                attrs[`attribute-${index}`] = { x: get(conf).gridSize / 2, ...text };
                attrs[`attribute-name-${index}`] = { text: `${attribute.name}: `, ...text };
                attrs[`attribute-type-${index}`] = { text: attribute.type, fontWeight: "normal", ...text };
                attrs[`attribute-multiplicity-${index}`] = { text: multiplicityString, ...text }
                attrs[`attribute-id-${index}`] = { text: identifierString, fontStyle: "italic", ...text }
                markup.push({
                    tagName: "text",
                    selector: `attribute-${index}`,
                    children: [
                        { tagName: "tspan", selector: `attribute-name-${index}` },
                        { tagName: "tspan", selector: `attribute-type-${index}` },
                        { tagName: "tspan", selector: `attribute-multiplicity-${index}` },
                        { tagName: "tspan", selector: `attribute-id-${index}` }
                    ]
                });

                y += get(conf).gridSize * 2;

            });

            attrs["divider2"] = {
                stroke: bodyStroke,
                y1: y,
                y2: y,
                visibility:
                    attributes.length > 0 && operations.length > 0 ? "visible" : "hidden",
            };

            operations.forEach((op, index) => {
                const text = operationToString(op);
                width = Math.max(width, lengthToGridEven(measureText(text) + get(conf).gridSize));

                attrs[`operation${index} `] = {
                    text: text,
                    x: get(conf).gridSize / 2,
                    y: y + get(conf).gridSize,
                    textAnchor: "left",
                    textVerticalAnchor: "middle",
                    fontSize: get(conf).fontSize,
                };
                markup.push({ tagName: "text", selector: `operation${index} ` });

                y += get(conf).gridSize * 2;
            });

            width = Math.max(lengthToGridEven(this.size().width), width);
            let height = Math.max(
                lengthToGridEven(this.size().height),
                lengthToGridEven(y),
            );

            for (const port of this.getPorts()) {
                if (graph.getLinks().some((linkView) => {
                    return linkView.get("source").port == port.id ||
                        linkView.get("target").port == port.id
                })) {

                    if (port.type == "t" || port.type == "b") {
                        width = Math.max(
                            width,
                            lengthToGridEven(port.args?.x as number)
                        )
                    }

                    if (port.type == "l" || port.type == "r") {
                        height = Math.max(
                            height,
                            lengthToGridEven(port.args?.y as number)
                        )
                    }
                }
            }

            this.resize(width, height);
            this.attr(attrs);
            this.set('ports', {
                items: getPerimeterPorts(width, height, this.id).map(port => {
                    return {
                        attrs: {
                            body: {
                                magnet: true,
                                r: get(conf).gridSize / 2,
                                fill: 'transparent',
                                strokeWidth: 2,
                            }
                        },
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'body'
                            },
                        ],
                        ...port
                    }
                })
            })
            this.set('markup', markup)
        }
    }
);
