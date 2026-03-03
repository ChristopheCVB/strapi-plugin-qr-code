import type { PanelComponent } from '@strapi/content-manager/strapi-admin'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { Button, Flex, Typography, Link } from '@strapi/design-system'
import { Download, ExternalLink } from '@strapi/icons'
import { useFetchClient } from '@strapi/strapi/admin'

import { PLUGIN_ID } from '../pluginId'
import { qrToEPS } from '../utils/qr-to-eps'
import type { Config } from '../../../server/src/config'

const QRCodePanel: PanelComponent = (props) => {
  const { activeTab, model, documentId } = props

  const { get } = useFetchClient()

  const [features, setFeatures] = useState<Config['contentTypes'][number]['features']>(undefined)
  const [uri, setUri] = useState<string | undefined>(undefined)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const downloadAsSvg = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'qr-code.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadAsPng = async () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const image = new Image()
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return

    // Render PNG at a larger, fixed pixel size for better visibility
    const exportSize = 1024
    canvas.width = exportSize
    canvas.height = exportSize

    await new Promise<void>((resolve, reject) => {
      image.onload = () => {
        context.clearRect(0, 0, exportSize, exportSize)
        context.drawImage(image, 0, 0, exportSize, exportSize)
        resolve()
      }
      image.onerror = () => reject(new Error('Failed to render SVG to image'))
      image.src = url
    })

    const pngUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = pngUrl
    link.download = 'qr-code.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function downloadAsEps(value: string) {
    const eps = await qrToEPS(value, { ecLevel: 'M', marginModules: 1, ptPerModule: 10 })
    const blob = new Blob([eps], { type: 'application/postscript;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'qr-code.eps'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (model && documentId && activeTab) {
      get<{ computedValue: string, features: Config['contentTypes'][number]['features'] }>(`/${PLUGIN_ID}/value?uid=${model}&status=${activeTab}&documentId=${documentId}`)
        .then((response) => {
          setUri(response.data.computedValue)
          setFeatures(response.data.features)
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Error fetching QR code value:', error)
          setUri(undefined)
          setFeatures(undefined)
        })
    }
  }, [activeTab, model, documentId])

  if (!uri) {
    return null
  }
  
  return {
    title: 'QR Code',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <QRCodeSVG
          ref={svgRef}
          value={uri}
          level="M"
          size={1024}
          title={uri}
          marginSize={1}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
        <Flex direction="column" gap={3}>
          {features?.link && (
            <Flex direction="column" gap={2}>
              <Typography variant="pi" fontWeight="bold" textColor="neutral800">
                URL:
              </Typography>
              <Link 
                href={uri} 
                target="_blank" 
                rel="noopener noreferrer"
                startIcon={<ExternalLink />}
                style={{ 
                  wordBreak: 'break-all',
                  textDecoration: 'none',
                }}
              >
                {uri}
              </Link>
            </Flex>
          )}
          {features && (features.svg || features.png || features.eps) && (
            <Flex gap={2} wrap="wrap">
              {features?.svg && (
                <Button startIcon={<Download />} onClick={downloadAsSvg}>
                  Download SVG
                </Button>
              )}
              {features?.png && (
                <Button startIcon={<Download />} onClick={downloadAsPng}>
                  Download PNG
                </Button>
              )}
              {features?.eps && (
                <Button startIcon={<Download />} onClick={() => downloadAsEps(uri)}>
                  Download EPS
                </Button>
              )}
            </Flex>
          )}
        </Flex>
      </div>
    ),
  }
}

export default QRCodePanel
