import { defineField, defineType } from "sanity";

export default defineType({
  name: "featured",
  title: "Featured",
  type: "document",
  fields: [
    defineField({
      name: "featuredProjects",
      title: "Featured Projects",
      type: "array",
      of: [{ type: "reference", to: { type: "project" } }],
    }),
    defineField({
      name: "featuredPosts",
      title: "Featured Posts",
      type: "array",
      of: [{ type: "reference", to: { type: "post" } }],
    }),
  ],
});
