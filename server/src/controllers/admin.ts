import type { Core, UID } from '@strapi/strapi'
import type { Config } from 'src/config'
import type { Context } from 'koa'
import { PLUGIN_ID } from '../pluginId'

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getQRCodeValue(ctx: Context): Promise<{computedValue: string}> {
    const { uid, status, documentId } = ctx.request.query as { uid: UID.ContentType, status: 'draft' | 'published', documentId: string }
    
    // Get config and find right content-type with uid
    const contentTypes: Config['contentTypes'] = strapi.plugin(PLUGIN_ID).config('contentTypes')
    const contentType = contentTypes.find(content => content.uid === uid)

    const result: Pick<Config['contentTypes'][number], 'features'> & {
      computedValue: string | undefined
    } = {
      computedValue: undefined,
      features: contentType?.features,
    }

    if (contentType && status && documentId) {
      try {
        const document = await strapi.documents(uid).findOne({ documentId, status, populate: contentType.populate })
        result.computedValue = await contentType.computeValue(uid, status, document)
      } catch (error) {
        throw error instanceof Error ? error : new Error(`Error while fetching data from ${uid} collection or calling computeValue function: ${error}`)
      }
    }
    else{
      ctx.throw(404, `Configuration for content type ${uid} not found.`)
    }
    return result
  },
})

export default controller
