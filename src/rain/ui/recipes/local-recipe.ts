export type RainLocalCandidateToken = string;

export type RainLocalRecipePromotionStatus =
  | "not-proposed"
  | "proposed"
  | "promoted"
  | "deprecated";

export interface RainLocalRecipe<
  Part extends string = string,
  Origin extends string = string,
> {
  id: string;
  scope: "feature" | "app" | "component" | (string & {});
  origin: Origin;
  classes: Partial<Record<Part, string>>;
  modifiedParts: readonly Part[];
  candidateTokens: readonly RainLocalCandidateToken[];
  promotionStatus: RainLocalRecipePromotionStatus;
}

export function defineRainLocalRecipe<
  Part extends string = string,
  Origin extends string = string,
>(recipe: RainLocalRecipe<Part, Origin>): RainLocalRecipe<Part, Origin> {
  return recipe;
}

export function getRainLocalRecipePart<
  Part extends string = string,
  Origin extends string = string,
>(
  recipe: RainLocalRecipe<Part, Origin> | undefined,
  part: Part,
): string | undefined {
  return recipe?.classes?.[part];
}
