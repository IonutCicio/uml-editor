import * as joint from "@joint/core";

// Note: this is only for autocomplete, jointjs handles them internally

export interface IUMLClass extends joint.dia.Element {
    update(): void;

    get(key: "definition"): string;
    // get(key: "name"): string;
    // get(key: "attributes"): UMLAttribute[];
    // get(key: "operations"): UMLOperation[];
}

export interface IUMLLink extends joint.dia.Link {
    update(): void;

    get(key: "sourceMultiplicity"): string;
    get(key: "name"): string;
    get(key: "targetMultiplicity"): string;
}

export class Multiplicity {
    private _lower: number = 1;
    private _upper: number | "*" = 1;

    get lower(): number {
        return this._lower;
    }

    set lower(value: number) {
        this._validateIntGEZ(value)
        this._validateBounds(value, this.upper)

        this._lower = value;
    }

    get upper(): number | "*" {
        return this._upper;
    }

    set upper(value: number | "*") {
        this._validateIntGEZ(value)
        this._validateBounds(this.lower, value)

        this._upper = value;
    }

    toString(): string {
        return this._lower == this._upper && this._lower == 1 ? "" : ` [${this._lower}..${this._upper}]`
    }

    private _validateIntGEZ(value: number | "*") {
        if (value == "*") {
            return;
        }

        if (!Number.isInteger(value)) {
            throw new Error()
        }

        if (value < 0) {
            throw new Error();
        }
    }

    private _validateBounds(lower: number, upper: number | "*") {
        if (upper !== "*" && upper < lower) {
            throw new Error();
        }
    }

}

export type Id = { enabled: false } | { enabled: true, number?: number };

export class Identifier {
    private _value: Id = { enabled: false };

    get value(): Id {
        return this._value;
    }

    set value(value: Id) {
        this._validateIntGT1(value);
        this._value = this.value;
    }

    toString(): string {
        return this.value.enabled ? ` {id${this.value.number ? this.value.number : ""}` : ""
    }

    private _validateIntGT1(value: Id) {
        if (value.enabled && value.number != undefined) {
            if (!Number.isInteger(value.number)) {
                throw new Error();
            }

            if (value.number < 1) {
                throw new Error();
            }
        }
    }
}


export class String1 {
    private _value: string = "";

    constructor(
        value: string
    ) {
        this.value = value;
    }

    get value(): string {
        return this._value;
    }

    set value(value: string) {
        if (!/^\S(.*\S)$/.test(value)) {
            throw new Error();
        }

        this._value = value;
    }

    toString(): string {
        return this.value;
    }

}

// export class UMLAttributeData {
//     public type: String1 = new String1("Type")
//     public multiplicity: Multiplicity = new Multiplicity()
//     public identifier: Identifier = new Identifier()
//
//     toString(): string {
//         return `: ${this.type.toString()}${this.multiplicity.toString()}${this.identifier.toString()}`;
//     }
// }

export interface UMLAttribute {
    name: string,
    type: string,
    multiplicityLower: number
    multiplicityUpper: number | "*"
    identifierEnabled: boolean,
    identifierNumber?: number
}

// export type Id = { enabled: false } | { enabled: true, number?: number };

export interface UMLParameter {
    name: string;
    type: string;
    multiplicity: Multiplicity;
}

export interface UMLOperation {
    name: string;
    parameters?: UMLParameter[];
    type: string;
    multiplicity: Multiplicity;
}
