import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const exportToPdf = (title: string, headers: string[], data: any[][]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 29);

  doc.autoTable({
    startY: 35,
    head: [headers],
    body: data,
    theme: 'striped',
    headStyles: { fillColor: [30, 144, 255] }, // A shade of blue
  });

  const fileName = `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const shareToWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}
