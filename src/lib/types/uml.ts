import * as joint from "@joint/core";

// Note: this is only for autocomplete, jointjs handles them internally

export interface IUMLClass extends joint.dia.Element {
    update(): void;

    get(key: "definition"): string;
}

export interface IUMLLink extends joint.dia.Link {
    update(): void;

    get(key: "sourceMultiplicity"): string;
    get(key: "name"): string;
    get(key: "targetMultiplicity"): string;
}

// get(key: "name"): string;
// get(key: "attributes"): UMLAttribute[];
// get(key: "operations"): UMLOperation[];

// TODO: No IUMLStuff... maybe?
// Just a big ass UMLClass(definition) <- this is a string! and "could possibly return a class"
// And, also, we could have something like .toString() for operations, or stuff like that...



