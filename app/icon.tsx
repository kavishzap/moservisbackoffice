import { ImageResponse } from "next/og"
import { readFile } from "fs/promises"
import { join } from "path"

import { ZOTSERVIS_LOGO_BG } from "@/lib/brand"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default async function Icon() {
  const logoBuf = await readFile(join(process.cwd(), "public", "logo.png"))
  const src = `data:image/png;base64,${Buffer.from(logoBuf).toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ZOTSERVIS_LOGO_BG,
        }}
      >
        <img
          src={src}
          alt=""
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  )
}
