import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { drawShareCard, SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH, type ShareCardData } from '../utils/shareCard'

type Props = { data: ShareCardData }

/**
 * Rend la carte de partage en pleine résolution (1080x1920) dans le buffer du
 * canvas, mais l'affiche réduite via CSS : le rendu reste net pour l'export/partage
 * tout en tenant dans la modale de victoire.
 */
const ShareCardCanvas = forwardRef<HTMLCanvasElement, Props>(({ data }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

  useEffect(() => {
    if (canvasRef.current) drawShareCard(canvasRef.current, data)
  }, [data])

  return (
    <canvas
      ref={canvasRef}
      width={SHARE_CARD_WIDTH}
      height={SHARE_CARD_HEIGHT}
      className="mx-auto block h-auto w-[150px] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:w-[170px]"
    />
  )
})

ShareCardCanvas.displayName = 'ShareCardCanvas'

export default ShareCardCanvas
