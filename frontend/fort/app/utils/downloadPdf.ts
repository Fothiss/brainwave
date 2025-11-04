import html2pdf from "html2pdf.js";

export async function downloadPdf(elementById: string) {
    const element = document.getElementById(elementById);

    html2pdf(element, {
        margin: 1,
        filename: 'document.pdf',
        image: {type: 'jpeg', quality: 0.98},
        html2canvas: {dpi: 192, letterRendering: true},
        jsPDF: {unit: 'in', format: 'letter', orientation: 'portrait'}
    });
}
