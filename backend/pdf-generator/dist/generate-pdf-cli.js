"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const renderer_1 = __importDefault(require("@react-pdf/renderer"));
const react_1 = __importDefault(require("react"));
const fs_1 = __importDefault(require("fs"));
const InvoicePDF_1 = __importDefault(require("./components/InvoicePDF"));
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Usage: node generate-pdf-cli.js <input_json_file_path> <output_pdf_file_path>");
        process.exit(1);
    }
    const jsonFilePath = args[0];
    const outputPath = args[1];
    try {
        const jsonDataString = fs_1.default.readFileSync(jsonFilePath, "utf8");
        const jsonData = JSON.parse(jsonDataString);
        const doc = react_1.default.createElement(InvoicePDF_1.default, {
            orderCode: jsonData.orderCode,
            date: jsonData.date,
            items: jsonData.items,
            customerName: jsonData.customerName,
            customerEmail: jsonData.customerEmail,
            address: jsonData.address,
            totalPrice: jsonData.totalPrice,
        });
        const stream = await renderer_1.default.renderToStream(doc);
        const writeStream = fs_1.default.createWriteStream(outputPath);
        stream.pipe(writeStream);
        writeStream.on("finish", () => {
            process.exit(0);
        });
        writeStream.on("error", (err) => {
            console.error("Write stream error:", err);
            process.exit(1);
        });
    }
    catch (err) {
        console.error("PDF CLI error:", err);
        process.exit(1);
    }
}
main();
