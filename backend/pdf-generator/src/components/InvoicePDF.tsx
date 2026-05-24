import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import React from "react";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#27272a",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  meta: {
    textAlign: "right",
  },
  metaText: {
    fontSize: 9,
    color: "#71717a",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#18181b",
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e4e7",
    paddingBottom: 2,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailsColumn: {
    width: "48%",
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f4f4f5",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e4e7",
    padding: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e4e4e7",
    padding: 6,
  },
  colDesc: { width: "50%" },
  colQty: { width: "15%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },
  boldText: { fontWeight: "bold" },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  summaryGrid: {
    width: "40%",
    borderTopWidth: 1,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#7c3aed",
  },
  totalText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#7c3aed",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#e4e4e7",
    paddingTop: 10,
    textAlign: "center",
    fontSize: 8,
    color: "#a1a1aa",
  },
});

interface InvoicePDFProps {
  orderCode: string;
  date: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  customerName: string;
  customerEmail: string;
  address: string;
  totalPrice: number;
}

export default function InvoicePDF({
  orderCode,
  date,
  items,
  customerName,
  customerEmail,
  address,
  totalPrice,
}: InvoicePDFProps) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>ShopNow Inc.</Text>
            <Text style={styles.metaText}>123 Digital Square, Commerce Plaza</Text>
            <Text style={styles.metaText}>support@shopnow.com | +1 (555) 019-0000</Text>
          </View>
          <View style={styles.meta}>
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>INVOICE</Text>
            <Text style={styles.metaText}>Invoice Code: {orderCode}</Text>
            <Text style={styles.metaText}>Date: {date}</Text>
          </View>
        </View>

        {/* Client & Shipping Metadata */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: "bold" }}>{customerName}</Text>
            <Text style={styles.metaText}>{customerEmail}</Text>
          </View>
          <View style={styles.detailsColumn}>
            <Text style={styles.sectionTitle}>Ship To</Text>
            <Text style={styles.metaText}>{address}</Text>
          </View>
        </View>

        {/* Order Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.boldText]}>Description</Text>
            <Text style={[styles.colQty, styles.boldText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.boldText]}>Price</Text>
            <Text style={[styles.colTotal, styles.boldText]}>Amount</Text>
          </View>

          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>${item.price.toFixed(2)}</Text>
              <Text style={styles.colTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryRow}>
              <Text style={styles.metaText}>Subtotal</Text>
              <Text>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.metaText}>Shipping</Text>
              <Text>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.metaText}>Tax (8%)</Text>
              <Text>${tax.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total Due</Text>
              <Text style={styles.totalText}>${totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for choosing ShopNow! If you have any inquiries regarding this invoice, please reach out to our helpdesk.
        </Text>
      </Page>
    </Document>
  );
}
