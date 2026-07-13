import { z } from "zod";

export const UNIT_LABEL_MAX = 255; // backend varchar(255)

/**
 * The backend caps unit creation at 20 labels per request; product caps a
 * wizard property at 20 units total. The units step enforces the remaining
 * capacity (20 − existing) itself — only it knows the fetched list.
 */
export const UNITS_PER_PROPERTY_MAX = 20;

export const unitLabelSchema = z
	.string()
	.trim()
	.min(1, "Please enter a unit label")
	.max(UNIT_LABEL_MAX, "That label looks a little long");

export const addUnitsFormSchema = z
	.object({
		label: unitLabelSchema,
		count: z
			.number("How many of this unit?")
			.int("Whole numbers only")
			.min(1, "At least 1")
			.max(
				UNITS_PER_PROPERTY_MAX,
				`Up to ${UNITS_PER_PROPERTY_MAX} units`,
			),
	})
	.superRefine((values, ctx) => {
		// Worst-case suffix visible to the schema is " " + count; the component
		// re-checks with the real continuation start before posting.
		if (
			values.count > 1 &&
			values.label.length + 1 + String(values.count).length >
				UNIT_LABEL_MAX
		) {
			ctx.addIssue({
				code: "custom",
				path: ["label"],
				message:
					"That label is too long once numbered — try a shorter one",
			});
		}
	});
export type AddUnitsFormValues = z.infer<typeof addUnitsFormSchema>;

export const createUnitsBodySchema = z.object({
	labels: z
		.array(unitLabelSchema)
		.min(1, "Add at least one unit")
		.max(
			UNITS_PER_PROPERTY_MAX,
			`Up to ${UNITS_PER_PROPERTY_MAX} units per request`,
		)
		.refine(
			(labels) => new Set(labels).size === labels.length,
			"Unit labels must be unique",
		),
});
export type CreateUnitsBody = z.infer<typeof createUnitsBodySchema>;

export const updateUnitBodySchema = z.object({
	label: unitLabelSchema,
});
export type UpdateUnitBody = z.infer<typeof updateUnitBodySchema>;

/** Unit as serialized by the backend (forwarded unchanged by the BFF). */
export type Unit = {
	id: string;
	community_id: string;
	property_id: string;
	label: string;
	created_at: string;
	updated_at: string;
};
