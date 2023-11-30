import { type ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
export function defineFunction<TSchema extends ZodTypeAny>(
  name: string,
  schema: TSchema
) {
  let jsonSchema: any = zodToJsonSchema(schema, name)?.definitions?.[name];
  // console.log("🚀 | jsonSchema:", jsonSchema);

  return {
    name,
    description: jsonSchema?.description,
    parameters: {
      type: "object",
      properties: jsonSchema?.properties,
      required: jsonSchema?.required,
    },
  };
}
