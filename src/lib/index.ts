// place files you want to import through the `$lib` alias in this folder.
import { writable } from 'svelte/store';

export const conf = writable({
    gridSize: 16,
    fontSize: 13
});


// TODO: some kind of reference? like... Class -> definition -> line 3 -> col 12? Also add line numbers in textarea for definition;
// TODO: What do I want here? I want it to still work somehow... so "do it"
// But I have to add erors, and reference the thing that created the error.
// Ah, yeah! if it is an error, then just show the normal string!
// And maybe a reference to the object id (which is generic and passed in from the tryFrom) Maybe optional?
// The identifier is something like : "object id" + extra annotation on line and column?
// TODO: there is no need to pass the id! You can just get the list of errors!
// Then, the caller decides what to do with it!

// TODO: after the tryFrom, map the result to a new one with the actual problematic line (or something like that)! Do it in UMLClass

// TODO: make the regex more "flexible" (allow for invalid values), but give warnings / errors;
// TODO: export type UnparsedString = string; or something, make it "package" constructor, and public read?

// 3 options:
// 1. Couldn't parse at all, so I give you the input string 
// 2. Could parse, but there are some errors / warnings
// 3. Could parse, there are no errors warnings 

// A `Result` is either value or an error.
// export type Result<T, E> = T | E;

// A `WeakResult` contains a usable value which can be decorated with errors.
export type WeakResult<T, E> = {
    value: T;
    error: E;
};

export enum Severity {
    Error,
    Warning,
    Hint,
}

export class Diagnostic {
    constructor(
        public readonly message: string,
        public readonly severity: Severity
    ) { }
}

export type RawString = string;

export type ErrString = string;

const REQ: [RegExp, ErrString] = [/\S/, ""];

const STR_ALPHANUMERIC: [RegExp, ErrString] = [/^[a-z\d]*$/i, ""];
const STR_WORD: [RegExp, ErrString] = [/^\w*$/, ""];

const INT_NAT: [RegExp, ErrString] = [/^\d+$/, ""];
const INT_POS: [RegExp, ErrString] = [/^[1-9]\d*$/, ""];

const FMT_SNAKE: [RegExp, ErrString] = [/^[a-z_]*$/, ""];
const FMT_PASCAL: [RegExp, ErrString] = [/^(?:[A-Z][a-z\d]*)*$/, ""];
const FMT_PASCAL_LAX: [RegExp, ErrString] = [/^(?:[A-Z][^A-Z]*)*$/, ""];

function checkValue(value: string, diagnostics: [RegExp, ErrString][]): WeakResult<string, ErrString[]> {
    return {
        value,
        error: diagnostics.filter(([regexp, _]) => !regexp.test(value)).map(([_, diagnostic]) => diagnostic)
    };
}

export class UMLClass {
    private constructor(
        public readonly name: WeakResult<string, ErrString[]>,
        public readonly attributes: (Attribute | RawString)[],
        public readonly operations: (Operation | RawString)[]
    ) { }

    public static fromString(string: RawString): UMLClass {
        // UMLClass.fromString never fails, because `"".split(/\n\n\s*/) -> [""]`.
        const [class_name, attributes, operations]: RawString[] = string.trim().split(/\n\n\s*/);

        return new UMLClass(
            checkValue(class_name.trim(), [REQ, STR_ALPHANUMERIC, FMT_PASCAL]),
            attributes && /\S/.test(attributes)
                ? attributes.trim().split(/\n\s*/).map(Attribute.fromString)
                : [],
            operations && /\S/.test(operations)
                ? operations.trim().split(/\n\s*/).map(Operation.fromString)
                : []
        );
    }
}

export class Attribute {
    private constructor(
        public readonly name: WeakResult<string, ErrString[]>,
        public readonly type: WeakResult<string, ErrString[]>,
        public readonly multiplicity: WeakResult<Multiplicity, ErrString[]>,
        public readonly identifiers: WeakResult<Identifier, ErrString>[],
    ) { }

    private static readonly REGEXP = new RegExp(
        [
            String.raw`^`,
            String.raw`([^:]*)`,
            String.raw`:`,
            String.raw`([^\[\{]*)`,
            String.raw`(?:\[([^\]]*)\]?)?`,
            String.raw`((?:[^\{]*\{[^\}]*\}?)*)`,
            String.raw`.*$`
        ].join('')
    );

    public static fromString(string: RawString): Attribute | RawString {
        const match = Attribute.REGEXP.exec(string);

        if (!match) {
            return string
        }

        return new Attribute(
            checkValue(match[1].trim(), [REQ, STR_WORD, FMT_SNAKE]),
            checkValue(match[2].trim(), [REQ, FMT_PASCAL_LAX]),
            match[3]
                ? Multiplicity.fromString(match[3])
                : { value: Multiplicity.DEFAULT, error: [] },
            match[4]
                ? Array.from(
                    match[4].matchAll(/\{([^\}]*)\}/gi),
                    (match) => Identifier.fromString(match[1])
                )
                : []
        );
    }

    public toString(): string {
        return [
            [this.name.value, this.type.value].filter(Boolean).join(": "),
            this.multiplicity.value.toString(),
            ...this.identifiers.map(({ value }) => value)
        ].filter(Boolean).join(" ");
    }
}

export class Operation {
    private constructor(
        public readonly name: WeakResult<string, ErrString[]>,
        public readonly parameters: (Parameter | RawString)[],
        public readonly type?: WeakResult<string, ErrString[]>,
        public readonly multiplicity?: WeakResult<Multiplicity, ErrString[]>,
        public readonly identifiers?: WeakResult<Identifier, ErrString>[],
    ) {
    }

    private static readonly REGEXP = new RegExp(
        [
            String.raw`^`,

            String.raw`([^\(]*)`,
            String.raw`(?:\(([^\)]*)\))`,
            String.raw`[^\:]*`,

            String.raw`(?:`,
            String.raw`:([^\[\{]*)`,
            String.raw`(?:\[([^\]]*)\]?)?`,
            String.raw`((?:[^\{]*\{[^\}]*\}?)*)`,
            String.raw`)?`,

            String.raw`.*$`
        ].join('')
    );

    public static fromString(string: RawString): Operation | RawString {
        const match = Operation.REGEXP.exec(string);

        if (!match) {
            return string;
        }

        return new Operation(
            checkValue(match[1].trim(), [REQ, STR_WORD, FMT_SNAKE]),
            match[2] && /\S/.test(match[2])
                ? match[2].trim().split(",").map(Parameter.fromString)
                : [],
            match[3]
                ? checkValue(match[3].trim(), [REQ, FMT_PASCAL_LAX])
                : undefined,
            match[4]
                ? Multiplicity.fromString(match[4])
                : { value: Multiplicity.DEFAULT, error: [] },
            match[5]
                ? Array.from(
                    match[5].matchAll(/\{([^\}]*)\}/gi),
                    (match) => Identifier.fromString(match[1])
                )
                : undefined,
        );
    }

    public toString(): string {
        return [
            [
                `${this.name.value}(${this.parameters.join(", ")})`,
                [
                    this.type?.value,
                    this.multiplicity
                        ? this.multiplicity.value.toString()
                        : undefined,
                    ...(this.identifiers ? this.identifiers.map(({ value }) => value) : [])
                ].filter(Boolean).join(" ")
            ].filter(Boolean).join(": "),
        ].filter(Boolean).join("")
    }
}

export class Parameter {
    private constructor(
        public readonly name: WeakResult<string, ErrString[]>,
        public readonly type: WeakResult<string, ErrString[]>,
        public readonly multiplicity: WeakResult<Multiplicity, ErrString[]>,
    ) { }

    public static fromString(string: RawString): Parameter | RawString {
        const match = /^([^:]*):([^\[]*)(?:\[([^\]]*)\]?)?$/.exec(string)

        if (!match) {
            return string;
        }

        return new Parameter(
            checkValue(match[1].trim(), [REQ, STR_ALPHANUMERIC, FMT_SNAKE]),
            checkValue(match[2].trim(), [REQ, FMT_PASCAL_LAX]),
            match[3]
                ? Multiplicity.fromString(match[3])
                : { value: Multiplicity.DEFAULT, error: [] },
        );
    }

    public toString(): string {
        return [
            [this.name.value, this.type.value].filter(Boolean).join(": "),
            this.multiplicity.value.toString(),
        ].filter(Boolean).join(" ");
    }
}

export class Multiplicity {
    private constructor(
        public readonly lower: number,
        public readonly upper: number | "*",
    ) { }

    public static readonly DEFAULT: Multiplicity = new Multiplicity(1, 1);

    public static fromString(string: string): WeakResult<Multiplicity, string[]> {
        const match = /^(\d+)\.\.(\d+)$/.exec(string)
        if (!match) {
            // TODO: WeakResult | RawString, as match could fail; or try to make it infallible.
            return { value: Multiplicity.DEFAULT, error: [] };
        }

        const lower: number = parseInt(match[1]);
        const upper = match[2] === "*" ? match[2] : parseInt(match[2]);

        return {
            value: new Multiplicity(lower, upper),
            error: [upper !== "*" && lower > upper ? "lower > upper" : ""]
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

    public static fromString(string: string): WeakResult<Identifier, string> {
        const match = /^id(\d+)?$/.exec(string)

        if (!match) {
            return { value: new Identifier(undefined), error: "" };
        }

        const number = match[1] ? parseInt(match[1]) : undefined;

        return {
            value: new Identifier(number),
            error: number && number < 1 ? "Number must be > 0" : ""
        };
    }

    public toString(): string {
        return `{id${this.number !== undefined ? this.number : ""}}`;
    }
}
