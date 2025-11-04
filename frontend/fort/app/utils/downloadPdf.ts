export async function downloadPdf(elementById: string) {
    if (typeof window === "undefined") return;

    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById(elementById);

    html2pdf(element, {
        margin: 1,
        filename: 'document.pdf',
        image: {type: 'jpeg', quality: 0.98},
        html2canvas: {dpi: 192, letterRendering: true},
        jsPDF: {unit: 'in', format: 'letter', orientation: 'portrait'}
    });
}
