import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Logo from '../assets/Logo.png';

export interface CompanyInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export interface ExportOptions {
    title: string;
    headers: string[];
    rows: any[][];
    fileName: string;
    companyInfo?: CompanyInfo;
}

// Convert image URL to Base64 in browser
const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve('');
            }
        };
        img.onerror = () => resolve('');
    });
};

/**
 * Utility class to export tabular reports to PDF and Excel format with premium, production-grade styles.
 */
export class ExportHelper {
    /**
     * Generates and downloads a highly professional multi-page PDF report.
     */
    static async exportToPDF(options: ExportOptions) {
        const { title, headers, rows, fileName, companyInfo } = options;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Dynamic styling variables
        const primaryColor = [13, 148, 136]; // #0d9488 - Teal 600
        const darkTextColor = [30, 41, 59]; // Slate 800
        const lightTextColor = [100, 116, 139]; // Slate 500
        
        // Page width and margins
        const pageWidth = doc.internal.pageSize.getWidth();
        const marginX = 14;
        
        // 1. Draw Company Header Banner (Pharmacy Letterhead)
        const compName = companyInfo?.name || 'SHREE VEERABHADRESHWARA PHARMA';
        const compEmail = companyInfo?.email || 'admin@svpharma.in';
        const compPhone = companyInfo?.phone || '+91 90198 43253';
        const compAddress = companyInfo?.address || 'Karnataka, India';
        
        // Try to load and add Base64 logo next to company details
        try {
            const logoBase64 = await getBase64Image(Logo);
            if (logoBase64) {
                doc.addImage(logoBase64, 'PNG', marginX, 10, 14, 14);
                
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(16);
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.text(compName, marginX + 18, 15);
                
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(8.5);
                doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
                doc.text(compAddress, marginX + 18, 20);
                doc.text(`Phone: ${compPhone}  |  Email: ${compEmail}`, marginX + 18, 24);
            } else {
                throw new Error("Logo base64 empty");
            }
        } catch {
            // Fallback header styling if logo fails to load
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text(compName, marginX, 15);
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
            doc.text(compAddress, marginX, 20);
            doc.text(`Phone: ${compPhone}  |  Email: ${compEmail}`, marginX, 24);
        }
        
        // Subtle divider line
        doc.setDrawColor(204, 251, 241); // Teal 100
        doc.setLineWidth(0.5);
        doc.line(marginX, 28, pageWidth - marginX, 28);
        
        // 2. Report Details & Title Section
        doc.setFont('times', 'bold'); // Georgia / Serif equivalent
        doc.setFontSize(15);
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
        doc.text(title.toUpperCase(), pageWidth / 2, 37, { align: 'center' });
        
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
        doc.text(`Generated: ${timestamp} IST`, pageWidth / 2, 42, { align: 'center' });
        
        // Draw a light teal card background for metadata summary
        doc.setFillColor(240, 253, 250); // Teal 50
        doc.roundedRect(pageWidth - 56, 31, 42, 12, 1.5, 1.5, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('METADATA', pageWidth - 52, 35);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
        doc.text(`Records: ${rows.length}`, pageWidth - 52, 39);
        
        // Clean rupee Unicode character to ASCII 'Rs.' globally to fix Helvetica rendering bug (splits into &)
        const cleanHeaders = headers.map(h => h.replace(/₹/g, 'Rs.'));
        const cleanRows = rows.map(row => row.map(cell => typeof cell === 'string' ? cell.replace(/₹/g, 'Rs.') : cell));

        // 3. Render Table
        autoTable(doc, {
            startY: 48,
            head: [cleanHeaders],
            body: cleanRows,
            theme: 'striped',
            headStyles: {
                fillColor: primaryColor as [number, number, number],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'left',
                valign: 'middle',
                cellPadding: 3.5,
            },
            bodyStyles: {
                textColor: darkTextColor as [number, number, number],
                fontSize: 8.5,
                cellPadding: 3,
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252], // Slate 50
            },
            margin: { left: marginX, right: marginX },
            didDrawPage: () => {
                // Multi-page Pagination Footer
                const str = `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`;
                doc.setFontSize(8);
                doc.setFont('Helvetica', 'normal');
                doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
                
                // Draw footer line
                doc.setDrawColor(241, 245, 249);
                doc.setLineWidth(0.5);
                doc.line(marginX, doc.internal.pageSize.getHeight() - 12, pageWidth - marginX, doc.internal.pageSize.getHeight() - 12);
                
                doc.text(str, pageWidth - marginX - 16, doc.internal.pageSize.getHeight() - 7);
                doc.text('SV Pharma Management System - Confidential Report', marginX, doc.internal.pageSize.getHeight() - 7);
            }
        });
        
        // Save the generated document
        doc.save(`${fileName}.pdf`);
    }

    /**
     * Generates and downloads a beautifully formatted, auto-fit Excel sheet.
     */
    static exportToExcel(options: ExportOptions) {
        const { title, headers, rows, fileName, companyInfo } = options;
        
        // Prepare Excel Rows (metadata followed by headers and data)
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        
        const fileData = [
            [companyInfo?.name?.toUpperCase() || 'SHREE VEERABHADRESHWARA PHARMA'],
            [`Report: ${title}`],
            [`Generated Date: ${timestamp} IST`],
            [`Total Records: ${rows.length}`],
            [], // Spacer row
            headers,
            ...rows
        ];
        
        const worksheet = XLSX.utils.aoa_to_sheet(fileData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        
        // Merge title header rows to make it look premium
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Merge pharmacy title
            { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Merge report name
        ];
        
        // Custom row heights for premium spacing
        worksheet['!rows'] = [
            { hpt: 26 }, // Title
            { hpt: 18 }, // Subtitle
            { hpt: 18 }, // Date
            { hpt: 18 }, // Metadata
            { hpt: 12 }, // Spacer
            { hpt: 22 }, // Headers
        ];

        // Auto-adjust column widths based on longest cell content
        const columnWidths = headers.map((_, colIdx) => {
            // Find max length in this column starting from header row (row index 5)
            let maxLen = headers[colIdx].toString().length;
            for (let r = 6; r < fileData.length; r++) {
                const cellVal = fileData[r][colIdx];
                if (cellVal !== undefined && cellVal !== null) {
                    const len = cellVal.toString().length;
                    if (len > maxLen) {
                        maxLen = len;
                    }
                }
            }
            return { wch: Math.min(Math.max(maxLen + 4, 10), 50) }; // cap between 10 and 50 chars
        });
        worksheet['!cols'] = columnWidths;
        
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
}

