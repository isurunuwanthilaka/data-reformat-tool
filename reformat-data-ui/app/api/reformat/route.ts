import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

// Configuration - matches the Python script
const PREFIX_LEN = 70
const BLOCK_SIZE = 32
const NUM_BLOCKS = 15
const KEEP_BLOCK_LEN = 11
const SUFFIX_START_INDEX = 70 + BLOCK_SIZE * NUM_BLOCKS

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Read the file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    if (!sheet) {
      return NextResponse.json({ message: "No sheet found in workbook" }, { status: 400 })
    }

    // Get all rows with values only
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    if (rows.length === 0) {
      return NextResponse.json({ message: "No data found in sheet" }, { status: 400 })
    }

    // Create new workbook for output
    const newWorkbook = XLSX.utils.book_new()
    const newSheet = XLSX.utils.aoa_to_sheet([])

    // Construct new header
    const originalHeader = rows[0]
    const prefixHeader = originalHeader.slice(0, PREFIX_LEN)
    const blockHeader = originalHeader.slice(70, 70 + KEEP_BLOCK_LEN)
    const suffixHeader = originalHeader.slice(SUFFIX_START_INDEX)

    const newHeader = [...prefixHeader, ...blockHeader, ...suffixHeader]
    XLSX.utils.sheet_add_aoa(newSheet, [newHeader], { origin: 0 })

    let rowIndex = 1

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const prefixData = row.slice(0, PREFIX_LEN)
      const suffixData = row.slice(SUFFIX_START_INDEX)

      // Get number of members from column 69 (index 69)
      let numMembers = 0
      try {
        const memberValue = row[69]
        if (memberValue !== null && memberValue !== undefined) {
          numMembers = Math.max(0, Number.parseInt(String(memberValue), 10))
        }
      } catch (e) {
        console.warn(`Row ${i}: Could not parse member count. Defaulting to 0.`)
      }

      // If 0 members, still output at least 1 row to preserve household data
      const loopCount = Math.max(1, numMembers)

      // Create empty placeholders
      const emptyPrefix = new Array(prefixData.length).fill(null)
      const emptySuffix = new Array(suffixData.length).fill(null)

      for (let j = 0; j < loopCount; j++) {
        // Use original prefix/suffix for first row, empty for subsequent rows
        const currentPrefix = j === 0 ? prefixData : emptyPrefix
        const currentSuffix = j === 0 ? suffixData : emptySuffix

        // Extract block data
        let blockData: any[] = []
        if (j < NUM_BLOCKS) {
          const start = 70 + j * BLOCK_SIZE
          const endKeep = start + KEEP_BLOCK_LEN
          blockData = row.slice(start, endKeep)
        } else {
          blockData = new Array(KEEP_BLOCK_LEN).fill(null)
        }

        // Combine into new row
        const newRow = [...currentPrefix, ...blockData, ...currentSuffix]
        XLSX.utils.sheet_add_aoa(newSheet, [newRow], { origin: rowIndex })
        rowIndex++
      }
    }

    // Save workbook and get buffer
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Reformatted Data")
    const outputBuffer = XLSX.write(newWorkbook, { type: "array", bookType: "xlsx" })

    // Return as file download
    return new NextResponse(outputBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="reformatted_data.xlsx"',
      },
    })
  } catch (error) {
    console.error("Error processing file:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to process file" },
      { status: 500 },
    )
  }
}
