import jsPDF from 'jspdf';
import { config } from '@/config/app-config';

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    fullName?: string;
    age?: number;
  };
  subtotal: number;
  tax: number;
  discountAmount: number;
  total: number;
  totalPaid: number;
  remainingAmount: number;
  status: string;
  createdAt: string;
}

interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  gst?: string;
}

export const generateInvoicePDF = (invoice: InvoiceData, hospitalInfo?: HospitalInfo) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = 25;

  const defaultHospitalInfo: HospitalInfo = {
    name: config.siteName,
    address: '123 Medical Street, Healthcare City, HC 12345',
    phone: '+91 90000 00000',
    email: 'info@auracare.com',
    gst: 'GST123456789'
  };

  const hospital = hospitalInfo || defaultHospitalInfo;

  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 55, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(hospital.name, margin, yPosition);
  
  yPosition += 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(hospital.address, margin, yPosition);
  
  yPosition += 5;
  pdf.text(`Phone: ${hospital.phone} | Email: ${hospital.email}`, margin, yPosition);
  
  if (hospital.gst) {
    yPosition += 5;
    pdf.text(`GST No: ${hospital.gst}`, margin, yPosition);
  }

  pdf.setTextColor(0, 0, 0);
  yPosition = 70;

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MEDICAL INVOICE', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 15;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice No: ${invoice.invoiceNumber}`, margin, yPosition);
  pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })}`, pageWidth - margin - 50, yPosition);
  
  yPosition += 6;
  const statusColor = getStatusColor(invoice.status);
  pdf.setTextColor(statusColor.r, statusColor.g, statusColor.b);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Status: ${invoice.status.toUpperCase()}`, margin, yPosition);
  pdf.setTextColor(0, 0, 0);

  yPosition += 15;
  pdf.setFillColor(243, 244, 246);
  pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 30, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('PATIENT INFORMATION', margin + 5, yPosition + 5);
  
  yPosition += 12;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`Name: ${invoice.patientId.firstName} ${invoice.patientId.lastName || ''}`, margin + 5, yPosition);
  
  yPosition += 5;
  pdf.text(`Phone: ${invoice.patientId.phone}`, margin + 5, yPosition);
  
  if (invoice.patientId.email) {
    pdf.text(`Email: ${invoice.patientId.email}`, pageWidth / 2, yPosition);
  }
  
  if (invoice.patientId.age) {
    yPosition += 5;
    pdf.text(`Age: ${invoice.patientId.age} years`, margin + 5, yPosition);
  }

  yPosition += 20;
  
  pdf.setFillColor(59, 130, 246);
  pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('DESCRIPTION', margin + 5, yPosition + 3);
  pdf.text('AMOUNT', pageWidth - margin - 5, yPosition + 3, { align: 'right' });
  
  yPosition += 15;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  pdf.setDrawColor(229, 231, 235);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12);
  
  pdf.text('Medical Consultation', margin + 5, yPosition);
  pdf.text(`₹${invoice.subtotal.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  
  yPosition += 25;
  const calcStartX = pageWidth - margin - 100;
  const amountX = pageWidth - margin - 5;
  
  pdf.setFontSize(9);
  pdf.text('Subtotal:', calcStartX, yPosition);
  pdf.text(`₹${invoice.subtotal.toLocaleString('en-IN')}`, amountX, yPosition, { align: 'right' });
  
  yPosition += 6;
  pdf.text('Tax (18% GST):', calcStartX, yPosition);
  pdf.text(`₹${invoice.tax.toLocaleString('en-IN')}`, amountX, yPosition, { align: 'right' });
  
  if (invoice.discountAmount > 0) {
    yPosition += 6;
    pdf.setTextColor(34, 197, 94);
    pdf.text('Discount:', calcStartX, yPosition);
    pdf.text(`-₹${invoice.discountAmount.toLocaleString('en-IN')}`, amountX, yPosition, { align: 'right' });
    pdf.setTextColor(0, 0, 0);
  }
  
  yPosition += 10;
  pdf.setFillColor(59, 130, 246);
  pdf.rect(calcStartX - 5, yPosition - 3, 105, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('TOTAL:', calcStartX, yPosition + 3);
  pdf.text(`₹${invoice.total.toLocaleString('en-IN')}`, amountX, yPosition + 3, { align: 'right' });
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  if (invoice.totalPaid > 0) {
    yPosition += 18;
    pdf.text('Amount Paid:', calcStartX, yPosition);
    pdf.setTextColor(34, 197, 94);
    pdf.text(`₹${invoice.totalPaid.toLocaleString('en-IN')}`, amountX, yPosition, { align: 'right' });
    
    if (invoice.remainingAmount > 0) {
      yPosition += 6;
      pdf.setTextColor(239, 68, 68);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Balance Due:', calcStartX, yPosition);
      pdf.text(`₹${invoice.remainingAmount.toLocaleString('en-IN')}`, amountX, yPosition, { align: 'right' });
    }
  }

  const footerY = pageHeight - 40;
  pdf.setTextColor(107, 114, 128);
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  
  pdf.setDrawColor(229, 231, 235);
  pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  pdf.text('Thank you for choosing our healthcare services!', pageWidth / 2, footerY, { align: 'center' });
  
  pdf.text('For any queries regarding this invoice, please contact us at the above mentioned details.', pageWidth / 2, footerY + 6, { align: 'center' });
  
  pdf.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, footerY + 12, { align: 'center' });

  const patientName = `${invoice.patientId.firstName}_${invoice.patientId.lastName || ''}`.replace(/\s+/g, '_');
  const fileName = `Invoice_${invoice.invoiceNumber}_${patientName}.pdf`;
  pdf.save(fileName);
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return { r: 34, g: 197, b: 94 };
    case 'pending':
      return { r: 245, g: 158, b: 11 };
    case 'partial':
      return { r: 59, g: 130, b: 246 };
    case 'cancelled':
    case 'refunded':
      return { r: 107, g: 114, b: 128 };
    default:
      return { r: 0, g: 0, b: 0 };
  }
};