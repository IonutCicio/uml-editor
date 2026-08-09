// place files you want to import through the `$lib` alias in this folder.
import { writable } from 'svelte/store';

export const conf = writable({
    gridSize: 16,
    fontSize: 13
});

export type Result<T, E> = {
    value: T;
    error: E;
};


export enum UMLClassError {
    MissingName,
    NameContainsInvalidCharacter,
    NameNotInPascalCase,
}

export class UMLClass {
    private constructor(
        public readonly name: string,
        public readonly attributes: Result<Attribute | string, string[]>[],
        public readonly operations: Result<Operation | string, string[]>[]
    ) { }

    public static fromString(string: string): Result<UMLClass, UMLClassError | undefined> {
        // "".split("\n\n") -> [""]
        const [name, attributes, operations]: string[] = string.trim().split("\n\n");

        let error: UMLClassError | undefined = undefined;
        if (!name) {
            error = UMLClassError.MissingName;
        } else if (!/[A-Za-z0-9]+/.test(name)) {
            error = UMLClassError.NameContainsInvalidCharacter;
        } else if (!/^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]*)*$/.test(name)) {
            error = UMLClassError.NameNotInPascalCase;
        }

        return {
            value: new UMLClass(
                name,
                // [],
                // []
                (attributes && attributes.trim() ? attributes.trim().split("\n").map(Attribute.fromString) : []),
                (operations && operations.trim() ? operations.trim().split("\n").map(Operation.fromString) : [])
            ),
            error: error
        };
    }
}


export class Attribute {
    private constructor(
        public readonly name: string,
        public readonly type: string,
        public readonly multiplicity: Result<Multiplicity, string>,
        public readonly identifier?: Result<Identifier, string>,
    ) { }

    private static readonly ATTRIBUTE_REGEX = new RegExp(
        [
            String.raw`^\s*`,
            String.raw`([^\s:](?:[^:]*[^\s:])?)`,
            String.raw`\s*:\s*`,
            String.raw`([^\s\[\{](?:[^\[\{]*[^\s\[\{])?)`,
            String.raw`(?:\s*\[(.*)\.\.(.*)\])?`,
            String.raw`(\s*\{\s*id(.*)\})?`,
            String.raw`\s*$`,
        ].join('')
    );

    public static fromString(string: string): Result<Attribute | string, string[]> {
        // TODO: moving the multiplicity check to the multiplicity allows for more granular errors!
        // TODO: make the regex more "flexible" (allow for invalid values), but give warnings / errors;
        // TODO: moving the check to the multiplicity and the identifier allows for more fine-grained error handling! 


        // String.raw`(?:\s*\[\s*(\d+)\s*\.\.\s*(\d+|\*)\s*\])?`,
        // String.raw`(\s*\{\s*id(\d*)\s*\})?`,

        const match = Attribute.ATTRIBUTE_REGEX.exec(string);
        // const match = /^([^\s:]+)\s*:\s*([^\[\{]*[^\s\[\{])(?:\s*\[\s*(\d+)\s*\.\.\s*(\d+|\*)\s*\])?(\s*\{\s*id(\d*)\s*\})?$/.exec(string.trim());

        if (!match) {
            return { value: string, error: ["Invalid attribute syntax."] }
        }

        let errors: string[] = []

        // name must be non empty
        // name and invalid characters
        // name must be in snake_case

        // type must be non empty
        // type and invalid characters
        // type must be PascalCase ? (not necessarily! It can contain extra stuff)

        return {
            value: new Attribute(
                match[1],
                match[2],
                match[3] && match[4] ?
                    Multiplicity.fromString(match[3], match[4]) :
                    { value: Multiplicity.DEFAULT, error: "" },
                match[5] ? Identifier.fromString(match[6]) : undefined
            ),
            error: errors
        }
    }

    public toString(): string {
        return [
            [`${this.name}`, `${this.type}`].filter(Boolean).join(": "), `${this.multiplicity.value}`, `${this.identifier ? this.identifier.value : ""}`
        ].filter(Boolean).join(" ");
    }
}

export class Operation {
    private constructor(
        public readonly name: string,
        public readonly parameters: Result<Parameter | string, string[]>[],
        public readonly type: string,
        public readonly multiplicity: Multiplicity,
    ) {
    }

    public static fromString(string: string): Result<Operation | string, string[]> {
        const match = /(\w+)\((.*?)\):\s(\w+)/.exec(string)

        if (!match) {
            return { value: string, error: ["Invalid operation syntax."] }
        }

        return {
            value: new Operation(
                match[1],
                (match[2] ? match[2].split(",").map(Parameter.fromString) : []),
                match[3],
                Multiplicity.DEFAULT
            ),
            error: []
        };
    }

    public toString(): string {
        //     const paramsStr = operation.parameters
        //         ?.map((param) => `${param.name}: ${param.type}`)
        //         .join(", ");
        //
        //     const paramsPart = paramsStr ? `(${paramsStr})` : "()";
        //
        //     let result = `${operation.name}${paramsPart} `;
        //
        //     if (operation.type) {
        //         result += `: ${operation.type} `;
        //     }
        //
        //     return result.trim();

        return "";
    }
}

export class Parameter {
    private constructor(
        public readonly name: string,
        public readonly type: string,
        public readonly multiplicity: Multiplicity,
    ) { }

    public static fromString(string: string): Result<Parameter | string, string[]> {
        return { value: string, error: [] }
    }
}

export class Multiplicity {
    private constructor(
        public readonly lower: number,
        public readonly upper: number | "*",
    ) { }

    public static readonly DEFAULT: Multiplicity = new Multiplicity(1, 1);

    public static fromString(lowerString: string, upperString: string): Result<Multiplicity, string> {
        const lower: number = parseInt(lowerString);
        const upper = upperString === "*" ? upperString : parseInt(upperString);

        return {
            value: new Multiplicity(lower, upper),
            error: upper !== "*" && lower > upper ? "lower > upper" : ""
        };
    }

    public toString(): string {
        return this.lower == 1 && this.upper == 1 ? "" : `[${this.lower}..${this.upper}]`
    }
}

export class Identifier {
    private constructor(
        public readonly number?: number
    ) {
    }

    public static fromString(string: string): Result<Identifier, string> {
        if (!string) {
            return { value: new Identifier(undefined), error: "" };
        }

        const number = parseInt(string);

        return {
            value: new Identifier(number),
            error: number < 1 ? "Number must be > 0" : ""
        };
    }

    public toString(): string {
        return `{id${this.number !== undefined ? this.number : ""}}`;
    }
}

// TODO: some kind of reference? like... Class -> definition -> line 3 -> col 12? Also add line numbers in textarea for definition;


// TODO: What do I want here? I want it to still work somehow... so "do it"
// But I have to add erors, and reference the thing that created the error.
// Ah, yeah! if it is an error, then just show the normal string!
// And maybe a reference to the object id (which is generic and passed in from the tryFrom) Maybe optional?
// The identifier is something like : "object id" + extra annotation on line and column?
// TODO: there is no need to pass the id! You can just get the list of errors!
// Then, the caller decides what to do with it!

// editor
// config

// I can return either class or no class
// I can either errors or no errors
// Like, I could return the class, with the list of warnings.

// TODO: after the tryFrom, map the result to a new one with the actual problematic line (or something like that)! Do it in UMLClass




// const match = /^\[\s*(\d+)\s*\.\.\s*(\d+|\*)\s*\]$/.exec(string);

// if (!match) {
//     return { value: string, error: "Invalid multiplicity syntax." };
// }

// if (upper !== "*" && lower > upper) {
//     return { value: new Multiplicity(lower, upper), error: "Lower bound should be <= upper bound." }
// }


// const multiplicityString =
//     attribute.multiplicity.lower === attribute.multiplicity.upper && attribute.multiplicity.lower == 1 ?
//         "" :
//         ` [${attribute.multiplicity.lower}..${attribute.multiplicity.upper}]`
// export type Id = { enabled: false } | { enabled: true, number?: number };

// const identifierString = "";
// const identifierString =
//     attribute.identifierEnabled ?
//         ` {id${attribute.identifierNumber ? attribute.identifierNumber : ""}}`
//         : "";
// return this.value.enabled ? `{id${this.value.number ? this.value.number : ""}` : ""

// private _value: Id = { enabled: false };

// get value(): Id {
//     return this._value;
// }
//
// set value(value: Id) {
//     this._validateIntGT1(value);
//     this._value = this.value;
// }

// private _validateIntGT1(value: Id) {
//     if (value.enabled && value.number != undefined) {
//         if (!Number.isInteger(value.number)) {
//             throw new Error();
//         }
//
//         if (value.number < 1) {
//             throw new Error();
//         }
//     }
// }

// lowerString: string, upperString: string

// const match = /^([^\s:]+)\s*:\s*([^\s\[\{]+)(?:\s*\[\s*(\d+)\s*\.\.\s*(\d+|\*)\s*\])?(?:\s*\{\s*id(\d*)\s*\})?$/.exec(string.trim());
// match[1] // name
// match[2] // type
// match[3] // multiplicity 
// match[5] // id


// private _lower: number = 1;
// private _upper: number | "*" = 1;
//
// private _validateIntGEZ(value: number | "*") {
//     if (value == "*") {
//         return;
//     }
//
//     if (!Number.isInteger(value)) {
//         throw new Error()
//     }
//
//     if (value < 0) {
//         throw new Error();
//     }
// }
//
// private _validateBounds(lower: number, upper: number | "*") {
//     if (upper !== "*" && upper < lower) {
//         throw new Error();
//     }
// }


// if (Number.isNaN(lower)) {
//     return { value: `[${lowerString}..${upperString}]`, error: "Lower bound is not a number" }
// }

// Number.isInteger()

// get lower(): number {
//     return this._lower;
// }
//
// set lower(value: number) {
//     this._validateIntGEZ(value)
//     this._validateBounds(value, this.upper)
//
//     this._lower = value;
// }
//
// get upper(): number | "*" {
//     return this._upper;
// }
//
// set upper(value: number | "*") {
//     this._validateIntGEZ(value)
//     this._validateBounds(this.lower, value)
//
//     this._upper = value;
// }



// type Result<T, E> =
//     | { ok: true; value: T }
//     | { ok: false; error: E };
//
// export type TryFromResult<T, E> = {
//     value: T | string;
//     error: E;
// };

// export class String1 {
//     private _value: string = "";
//
//     constructor(
//         value: string
//     ) {
//         this.value = value;
//     }
//
//     get value(): string {
//         return this._value;
//     }
//
//     set value(value: string) {
//         if (!/^\S(.*\S)$/.test(value)) {
//             throw new Error();
//         }
//
//         this._value = value;
//     }
//
//     toString(): string {
//         return this.value;
//     }
//
// }


// export interface UMLAttribute {
//     name: string,
//     type: string,
//     multiplicityLower: number
//     multiplicityUpper: number | "*"
//     identifierEnabled: boolean,
//     identifierNumber?: number
// }

// export class UMLAttributeData {
//     public type: String1 = new String1("Type")
//     public multiplicity: Multiplicity = new Multiplicity()
//     public identifier: Identifier = new Identifier()
//
//     toString(): string {
//         return `: ${this.type.toString()}${this.multiplicity.toString()}${this.identifier.toString()}`;
//     }
// }

// .split('\n')
// .filter((string) => string.length > 0)
// let attributes: TryFromResult<Attribute>[] = (attributesString || '')
//     .split('\n')
//     .filter((string) => string.length > 0)
//     .map(Attribute.tryFrom);

// let operations: Operation[] = (operationsString || '')
//     .split('\n')
//     .filter((string) => string.length > 0)
//     .map((string) => {
//     }) || [];


//     return {
//         name: "Unknown",
//         parameters: [],
//         type: 'Type',
//         multiplicity: new Multiplicity()
//     }
// }

// const parameters = ;
//     (value) => {
//     const [name, type] = value.split(":")
//     return {
//         name: name.trim(),
//         type: type.trim(),
//     }
// }
// )

// return {
//     name: match[1],
//     parameters: parametersArr,
//     type: match[3],
//     multiplicity: new Multiplicity()
// }


// public toString(): string {
//     return ''
// }



// export class UMLAssociation {
//
// }
