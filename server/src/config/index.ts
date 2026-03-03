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
    features: z.object({
      link: z.boolean().optional(),
      eps: z.boolean().optional(),
      png: z.boolean().optional(),
      svg: z.boolean().optional(),
    }).optional(),
  }).array().refine((contentTypes) => {
    const uids = contentTypes.map((contentType) => contentType.uid)
    return new Set(uids).size === uids.length
  }, {
    message: 'Duplicate content type UIDs are not allowed.',
  }),
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
