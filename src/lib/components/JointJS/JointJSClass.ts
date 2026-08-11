import { type IUMLClass, } from '$lib/types/uml';
import { graph, snapSize, measureText } from '$lib/utils';
import { Attribute, conf, Operation, Parameter, UMLClass } from '$lib';
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

// TODO: handle errors / warnings;
// TODO: make it more detailed, for [ ] too, and for () and for : (like operations and like that)
// TODO: get the anchors attached to this object, and take the minium of those heights / widths (dy, dx)...

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
            nameRect: {
                refWidth: '100%',
                fill: 'hsl(0, 0%, 95%)',
                stroke: 'black',
                strokeWidth: 2,

            },
            name: {
                refX: '50%',
                textAnchor: 'middle',
                textVerticalAnchor: 'middle',
                style: 'font-weight: 600 !important',
                fontSize: get(conf).fontSize,
            },
            divider: {
                x1: 0,
                x2: 'calc(w)',
                strokeWidth: 1,
            }
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

            const attrs: Record<string, any> = {};
            const markup: joint.dia.MarkupJSON = [
                { tagName: "rect", selector: "body" },
                { tagName: "rect", selector: "nameRect" },
                { tagName: "text", selector: `name` },
                { tagName: "line", selector: `divider` },
            ];

            let minWidth = this.size().width;
            let currentY = snapSize(
                measureText(umlClass.name.value).height + get(conf).gridSize,
                get(conf).gridSize * 2,
                Math.ceil
            );

            attrs["name"] = {
                text: umlClass.name.value,
                y: currentY / 2,
            };

            attrs["nameRect"] = {
                height: currentY,
                stroke: this.attr('body/stroke'),
                strokeWidth: this.attr('body/strokeWidth'),
            }

            minWidth = Math.max(minWidth, measureText(umlClass.name.value || 'Class').width + get(conf).gridSize)
            if (umlClass.attributes.length === 0 && umlClass.operations.length === 0) {
                currentY += get(conf).gridSize * 2;
            }

            umlClass.attributes.forEach((attribute, index) => {
                minWidth = Math.max(minWidth, measureText(attribute.toString()).width + get(conf).gridSize);

                const lineAttrs = { y: currentY + get(conf).gridSize, ...TEXT_ATTRS };

                const newAttrs: Record<string, any> = {};


                if (attribute instanceof Attribute) {
                    newAttrs[`attribute-name-${index}`] = {
                        text: `${attribute.name.value}: `,
                        ...lineAttrs
                    };

                    newAttrs[`attribute-type-${index}`] = {
                        text: attribute.type.value,
                        fontWeight: 400,
                        ...lineAttrs
                    };

                    let s = attribute.multiplicity.value.toString();
                    if (s) {
                        newAttrs[`attribute-multiplicity-${index}`] = {
                            text: ` ${s}`,
                            ...lineAttrs
                        };
                    }

                    s = attribute.identifiers.map(({ value }) => value).join(" ")
                    if (s) {
                        newAttrs[`attribute-id-${index}`] = {
                            text: ` ${s}`,
                            fontStyle: "italic",
                            ...lineAttrs
                        };
                    }
                } else {
                    newAttrs[`attribute-text-${index}`] = {
                        text: attribute,
                        ...lineAttrs,
                        ...ERROR_ATTRS
                    };
                }

                Object.assign(attrs, newAttrs);

                attrs[`attribute-${index}`] = {
                    x: get(conf).gridSize / 2,
                    ...lineAttrs
                };

                markup.push({
                    tagName: "text",
                    selector: `attribute-${index}`,
                    children: Object.keys(newAttrs)
                        .map((selector) => ({ tagName: "tspan", selector }))
                });

                currentY += get(conf).gridSize * 2;
            });

            attrs["divider"] = {
                stroke: this.attr('body/stroke'),
                y1: currentY,
                y2: currentY,
                visibility: umlClass.attributes.length > 0 && umlClass.operations.length > 0 ? "visible" : "hidden",
            };

            umlClass.operations.forEach((operation, index) => {
                minWidth = Math.max(minWidth, measureText(operation.toString()).width + get(conf).gridSize);

                const lineAttrs = { y: currentY + get(conf).gridSize, ...TEXT_ATTRS };

                const newAttrs: Record<string, any> = {};

                if (operation instanceof Operation) {
                    newAttrs[`operation-name-${index}`] = {
                        text: operation.name.value,
                        ...lineAttrs
                    };

                    newAttrs[`operation-lpar-${index}`] = { text: "(", ...lineAttrs };

                    operation.parameters.forEach((parameter, parameter_index) => {
                        if (parameter instanceof Parameter) {
                            if (parameter_index > 0) {
                                newAttrs[`operation-${index}-parameter-separator-${parameter_index}`] = {
                                    text: ", ",
                                    ...lineAttrs
                                }
                            }

                            newAttrs[`operation-${index}-parameter-name-${parameter_index}`] = {
                                text: `${parameter.name.value}: `,
                                ...lineAttrs
                            }

                            newAttrs[`operation-${index}-parameter-type-${parameter_index}`] = {
                                text: parameter.type.value,
                                fontWeight: 400,
                                ...lineAttrs
                            }

                            const s = parameter.multiplicity.value.toString();
                            if (s) {
                                newAttrs[`operation-${index}-parameter-multiplicity-${parameter_index}`] = {
                                    text: ` ${s}`,
                                    ...lineAttrs
                                };
                            }
                        } else {
                            newAttrs[`operation-${index}-parameter-text-${parameter_index}`] = {
                                text: parameter,
                                ...lineAttrs,
                                ...ERROR_ATTRS
                            };
                        }
                    });

                    newAttrs[`operation-rpar-${index}`] = { text: ")", ...lineAttrs };


                    if (operation.type) {
                        newAttrs[`operation-type-separator-${index}`] = {
                            text: ": ",
                            ...lineAttrs
                        };

                        newAttrs[`operation-type-${index}`] = {
                            text: operation.type.value,
                            fontWeight: 400,
                            ...lineAttrs
                        };
                    }

                    if (operation.multiplicity) {
                        const s = operation.multiplicity.value.toString();
                        if (s) {
                            newAttrs[`operation-multiplicity-${index}`] = {
                                text: ` ${s}`,
                                ...lineAttrs
                            };
                        }
                    }

                    if (operation.identifiers) {
                        const s = operation.identifiers.map(({ value }) => value).join(" ")
                        if (s) {
                            newAttrs[`operation-id-${index}`] = {
                                text: ` ${s}`,
                                fontStyle: "italic", ...lineAttrs
                            };
                        }
                    }
                } else {
                    newAttrs[`operation-text-${index}`] = {
                        text: operation,
                        ...lineAttrs,
                        ...ERROR_ATTRS
                    };
                }

                Object.assign(attrs, newAttrs);

                attrs[`operation-${index}`] = {
                    x: get(conf).gridSize / 2,
                    ...lineAttrs
                };

                markup.push({
                    tagName: "text",
                    selector: `operation-${index}`,
                    children: Object.keys(newAttrs)
                        .map((selector) => ({ tagName: "tspan", selector }))
                });

                currentY += get(conf).gridSize * 2;
            });

            this.resize(
                snapSize(minWidth, get(conf).gridSize * 2, Math.ceil),
                snapSize(Math.max(currentY, this.size().height), get(conf).gridSize * 2, Math.ceil)
            );
            this.attr(attrs);
            this.set('markup', markup)
        }
    }
);
