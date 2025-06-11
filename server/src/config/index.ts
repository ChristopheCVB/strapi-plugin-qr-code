// import type { Modules, UID } from '@strapi/strapi'
import { z } from 'zod'

const schemaDocument = z.object/*<Modules.Documents.Document<UID.ContentType>>*/({
  documentId: z.string().min(1),
  id: z.number().min(1),
})

const configSchema = z.object({
  contentTypes: z.object({
    uid: z.string().min(1),
    populate: z.union([z.string().array(), z.literal('*')]).optional(),
    computeValue: z.function().args(
      z.string().min(1),
      z.union([z.literal('draft'), z.literal('published')]),
      schemaDocument,
    ).returns(z.union([z.promise(z.string()), z.string()])),
  }).array(),
})

export type Config = z.infer<typeof configSchema>

export default {
  default: {
    contentTypes: [],
  },
  validator(config: unknown) {
    configSchema.parse(config)
  },
}
