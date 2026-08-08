import * as joint from "@joint/core";
import { get } from 'svelte/store';
import { conf } from ".";
import { JointJSActor } from "./components/JointJS/JointJSActor";
import { JointJSAssociation } from "./components/JointJS/JointJSAssociation";
import { JointJSClass } from "./components/JointJS/JointJSClass";
import { JointJSGeneralization } from "./components/JointJS/JointJSGeneralization";
import { JointJSInstanceOf } from "./components/JointJS/JointJSInstanceOf";
import { JointJSLink } from "./components/JointJS/JointJSLink";
import { JointJSNote } from "./components/JointJS/JointJSNote";
import { writable } from 'svelte/store';
import { JointJSObject } from "./components/JointJS/JointJSObject";
import { JointJSUseCase } from "./components/JointJS/JointJSUseCase";
import { JointJSDashedLine } from "./components/JointJS/JointJSDashedLine";

const cellNamespace = {
    ...joint.shapes,
    custom: {
        JointJSActor,
        JointJSAssociation,
        JointJSClass,
        JointJSGeneralization,
        JointJSInstanceOf,
        JointJSLink,
        JointJSNote,
        JointJSObject,
        JointJSUseCase,
        JointJSDashedLine,
    },
};

export const graph: joint.dia.Graph = new joint.dia.Graph(
    {},
    { cellNamespace },
);

export let pauseGraphToJSON = writable(false);

graph.on("add remove change", function() {
    if (get(pauseGraphToJSON)) {
        return;
    }

    localStorage.setItem("diagram", JSON.stringify(graph.toJSON()));
});


export const paper: joint.dia.Paper = new joint.dia.Paper({
    model: graph,
    background: { color: "white" },
    cellViewNamespace: cellNamespace,
    gridSize: get(conf).gridSize,
    drawGrid: {
        name: "fixedDot",
    },
    defaultRouter: {
        name: "manhattan",
        args: {
            padding: 20,
        }
    },
    interactive: {
        labelMove: true,
        linkMove: true,
    },
    snapLinks: true,
    defaultConnectionPoint: { name: 'anchor' },
    markAvailable: true,
    snapLabels: true,
    linkPinning: false,
});

export enum EditorMode {
    // Paper
    Panning,
    Selection,

    // UML Class Diagram
    DashedLine, // dashed line for AssociationClass or Note
    Generalization,

    // UML Class Diagram (extensional level)
    Object,
    Link,
    InstanceOf, // dashed line with arrow and "<<instance>>" stereotype

    // UML Use Case Diagram
    Actor,
    UseCase,

    // Extra
    Note
}

export function darkenHSL(hslString: string, amount = 20): string {
    // hsl(h, s%, l%)
    const match = hslString.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);

    if (!match) {
        return hslString;
    }

    let h = parseFloat(match[1]);
    const s = parseFloat(match[2]);
    let l = parseFloat(match[3]);

    l = Math.max(0, l - amount);

    if (h == 0) {
        return 'hsl(0, 0%, 30%)';
    }

    return `hsl(${h}, ${s}%, ${l}%)`;
}

export function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
        throw new Error("Could not parse Hex Color");
    }

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;

        s = l > 0.5
            ? d / (2 - max - min)
            : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function HSLToHex(hsl: string): string {
    const result = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i.exec(hsl);

    if (!result) {
        throw new Error("Could not parse Hex Color");
    }

    let h = parseFloat(result[1]);
    const s = parseFloat(result[2]);
    let l = parseFloat(result[3]);

    const hDecimal = l / 100;
    const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

        // Convert to Hex and prefix with "0" if required
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function getBorderColor(color: string): string {
    // check: white HSL (0% saturation, 100% lightness)
    if (/hsl\(\d+,\s*0%?,\s*100%?\)/.test(color)) {
        return "hsl(0, 100%, 0%)";
    }

    return darkenHSL(color, 20);
}


// TODO: basically make such a method, but you have to specify the rounding method, the gridsize (not take it from conf)
// And it can be something like "snapToGrid(point, gridSize, Math.ceil)"
export function snapSize(size: number, gridSize: number, roundingFunction: (n: number) => number): number {
    return roundingFunction(size / gridSize) * gridSize;
}

export function snapSizeToClosest(size: number): number {
    const floorSnap = snapSize(size, get(conf).gridSize, Math.floor);
    const ceilSnap = snapSize(size, get(conf).gridSize, Math.ceil);

    if (size - floorSnap < ceilSnap - size) {
        return floorSnap;
    }

    return ceilSnap;
}

export function lengthToGridEven(size: number): number {
    return snapSize(size, get(conf).gridSize, Math.ceil);
}


// export function lengthToGridEven(length: number): number {
//     return Math.ceil(length / (get(conf).gridSize * 2)) * get(conf).gridSize * 2
// }

// Math.floor(size / get(conf).gridSize) * get(conf).gridSize
// Math.ceil(size / get(conf).gridSize) * get(conf).gridSize

// return Math.ceil(length / get(conf).gridSize) * get(conf).gridSize

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
svg.appendChild(textElement);

svg.setAttribute("style", "position: absolute; bottom: 0; left: 0; z-index: -100;")
textElement.setAttribute("font-family", "Cascadia Code");
textElement.setAttribute("font-size", `${get(conf).fontSize}px`);
document.body.appendChild(svg);

export function computeTextLength(text: string) {
    textElement.textContent = text;
    return textElement.getBBox().width;
}

export function exportSVG() {
    const bbox = paper.getContentBBox();
    const svg = paper.el.querySelector("svg")?.cloneNode(true);
    if (!svg || !bbox || !(svg instanceof Element)) {
        return
    }

    svg.setAttribute('width', `${bbox.width}`);
    svg.setAttribute('height', `${bbox.height}`);
    svg.setAttribute('viewBox', `
        ${bbox.x} 
        ${bbox.y} 
        ${bbox.width} 
        ${bbox.height}
    `);


    svg.querySelector('.joint-grid-layer')?.remove();
    svg.querySelector('.joint-tools-layer')?.remove();

    const url = URL.createObjectURL(
        new Blob([new XMLSerializer().serializeToString(svg)], {
            type: "image/svg+xml;charset=utf-8",
        }),
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.svg";
    a.click();

    URL.revokeObjectURL(url);
}

export function exportJSON() {
    const url = URL.createObjectURL(
        new Blob([JSON.stringify(graph.toJSON())], {
            type: "application/json",
        }),
    );

    const a = document.createElement("a");
    a.href = url;
    // TODO: handle filename
    a.download = "diagram.json";
    a.click();
}

export function importJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", async (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.item(0);
        if (!file) {
            return;
        }

        try {
            const text = await file?.text();
            const json = JSON.parse(text);

            graph.fromJSON(json);
        } catch (err) {
            alert("Invalid JSON file.");
            console.error(err);
        }
    });

    input.click(); // Must happen inside user event
}

export function clickOutside(node: Node, callback: (node: Event) => void) {
    return outside(node, "click", callback);
}

export function tapOutside(node: Node, callback: (node: Event) => void) {
    return outside(node, "mousedown", callback);
}

function outside(
    node: Node,
    listener: string,
    callback: (node: Event) => void
) {
    const handleClick = (event: Event) => {
        if (
            node &&
            !node.contains(event.target as Node) &&
            !event.defaultPrevented
        ) {
            callback(event);
        }
    };

    document.addEventListener(listener, handleClick);

    return {
        destroy() {
            document.removeEventListener(listener, handleClick);
        },
    };
}


// startDirections: ['top', 'bottom', 'left', 'right'],
// endDirections: ['top', 'bottom', 'left', 'right']
// maximumLoops: 500
// args: {},
// defaultAnchor: {
//     name: 'perimeterGrid',
//     args: { gridSize: 10 }
// }
// defaultAnchor: function(endView, endMagnet, refPoint, anchorOptions) {
//     const bbox = endView.getNodeBBox(endMagnet);
//     const gridSize = 10; // Your perimeter grid size
//
//     // Find closest point on rectangle boundary aligned to gridSize
//     // const closestOnPerimeter = bbox.pointNearestToPoint(refPoint);
//     const closestOnPerimeter = { x: 10, y: 10 }
//
//     return new joint.g.Point(
//         Math.round(closestOnPerimeter.x / gridSize) * gridSize,
//         Math.round(closestOnPerimeter.y / gridSize) * gridSize
//     );
// }
// export function getPerimeterPorts(width: number, height: number, id: joint.dia.Cell.ID) {
//     let ports = []
//
//     let portSerialId = 0
//     for (let x = 0; x <= width; x += get(conf).gridSize) {
//         portSerialId++;
//         ports.push({ id: `${id}-port-t-${portSerialId} `, args: { x, y: 0 }, type: 't' })
//         ports.push({ id: `${id}-port-b-${portSerialId} `, args: { x, y: height }, type: 'b' })
//     }
//
//     portSerialId = 0;
//     for (let y = get(conf).gridSize; y < height; y += get(conf).gridSize) {
//         portSerialId++;
//         ports.push({ id: `${id}-port-l-${portSerialId} `, args: { x: 0, y }, type: 'l' })
//         ports.push({ id: `${id}-port-r-${portSerialId} `, args: { x: width, y }, type: 'r' })
//     }
//
//     return ports.map((port) => {
//         return {
//             attrs: {
//                 body: {
//                     magnet: true,
//                     r: get(conf).gridSize / 2,
//                     fill: 'transparent',
//                     strokeWidth: 2,
//                 }
//             },
//             markup: [
//                 {
//                     tagName: 'circle',
//                     selector: 'body'
//                 },
//             ],
//             ...port
//         }
//     });
// }


// function svgToPNG(svgString, width, height) {
//     return new Promise((resolve) => {
//         const img = new Image();
//         const blob = new Blob([svgString], { type: "image/svg+xml" });
//         const url = URL.createObjectURL(blob);
//
//         img.onload = function() {
//             const canvas = document.createElement("canvas");
//             canvas.width = width;
//             canvas.height = height;
//
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(img, 0, 0);
//
//             URL.revokeObjectURL(url);
//             resolve(canvas);
//         };
//
//         img.src = url;
//     });
// }
//
// const canvas = await svgToPNG(svgString, 1000, 800);
// const pngDataUrl = canvas.toDataURL("image/png");
//
// async function copyCanvasToClipboard(canvas) {
//     return new Promise((resolve) => {
//         canvas.toBlob(async (blob) => {
//             await navigator.clipboard.write([
//                 new ClipboardItem({
//                     "image/png": blob
//                 })
//             ]);
//             resolve();
//         });
//     });
// }

