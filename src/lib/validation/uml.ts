import type { IUMLClass, IUMLLink } from "$lib/types/uml";
import * as joint from "@joint/core";

// export function isUMLAttribute(value: unknown): value is UMLAttributeData {
//     return (
//         value != null &&
//         typeof value === "object" &&
//         "name" in value &&
//         typeof (value as any).name === "string" &&
//         "type" in value &&
//         typeof (value as any).type === "string" &&
//         (!("multiplicity" in value) ||
//             typeof (value as any).multiplicity === "string" ||
//             (value as any).multiplicity == null) &&
//         "isIdentifier" in value &&
//         typeof (value as any).isIdentifier === "boolean"
//     );
// }

export const areAttributesNameValid = (classElement: IUMLClass) => {
    const attributes = classElement.get("attributes");
    const nameMap: Record<string, number> = {};

    attributes.forEach(attr => {
        const name = attr.name.trim();
        if (name) {
            nameMap[name] = (nameMap[name] || 0) + 1;
        }
    });

    for (const [_, count] of Object.entries(nameMap)) {
        if (count > 1) {
            return false
        }
    }

    return true;
}

export const areClassNamesValid = (graph: joint.dia.Graph) => {
    const classes = graph.getCells().filter(cell => cell instanceof joint.dia.Element && cell.get("attributes") !== undefined) as IUMLClass[];
    const nameMap: Record<string, number> = {};

    classes.forEach(cls => {
        const name = cls.get("name").trim();
        if (name) {
            nameMap[name] = (nameMap[name] || 0) + 1;
        }
    });

    for (const [_, count] of Object.entries(nameMap)) {
        if (count > 1) {
            return false;
        }
    }

    return true;
};

export const areAssociationNamesValid = (graph: joint.dia.Graph) => {
    const classes = graph.getCells().filter(cell => cell instanceof joint.dia.Element && cell.get("attributes") !== undefined) as IUMLClass[];
    const associations = graph.getLinks().filter(link => link.get("name") !== undefined) as IUMLLink[];

    for (const cls of classes) {
        const connectedAssocs = associations.filter(assoc => {
            const source = assoc.getSourceElement();
            const target = assoc.getTargetElement();
            return (source && source.id === cls.id) || (target && target.id === cls.id);
        });

        const nameMap: Record<string, number> = {};

        connectedAssocs.forEach(assoc => {
            const name = assoc.get("name").trim();
            if (name) {
                nameMap[name] = (nameMap[name] || 0) + 1;
            }
        });

        for (const [_, count] of Object.entries(nameMap)) {
            if (count > 1) {
                return false;
            }
        }
    }

    return true;
};

export const areOperationsValid = (classElement: IUMLClass) => {
    const operations = classElement.get("operations");
    const nameMap: Record<string, number> = {};

    operations.forEach(op => {
        const name = op.name.trim();
        if (name) {
            nameMap[name] = (nameMap[name] || 0) + 1;
        }
    });

    for (const [_, count] of Object.entries(nameMap)) {
        if (count > 1) {
            return false
        }
    }

    return true;
};
