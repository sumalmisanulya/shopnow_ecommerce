import ReactPDF from "@react-pdf/renderer";
import React from "react";
import fs from "fs";
import InvoicePDF from "./components/InvoicePDF";

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: node generate-pdf-cli.js <input_json_file_path> <output_pdf_file_path>");
    process.exit(1);
  }
  const jsonFilePath = args[0];
  const outputPath = args[1];

  try {
    const jsonDataString = fs.readFileSync(jsonFilePath, "utf8");
    const jsonData = JSON.parse(jsonDataString);
    const doc = React.createElement(InvoicePDF, {
      orderCode: jsonData.orderCode,
      date: jsonData.date,
      items: jsonData.items,
      customerName: jsonData.customerName,
      customerEmail: jsonData.customerEmail,
      address: jsonData.address,
      totalPrice: jsonData.totalPrice,
    });

    const stream = await ReactPDF.renderToStream(doc as any);
    const writeStream = fs.createWriteStream(outputPath);
    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      process.exit(0);
    });
    writeStream.on("error", (err) => {
      console.error("Write stream error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("PDF CLI error:", err);
    process.exit(1);
  }
}

main();
