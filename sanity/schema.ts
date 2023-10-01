import { type SchemaTypeDefinition } from "sanity";

import project from "@/sanity/schemas/project";
import featured from "@/sanity/schemas/featured";
import tag from "@/sanity/schemas/tag";
import post from "@/sanity/schemas/post";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [tag, featured, project, post],
};
