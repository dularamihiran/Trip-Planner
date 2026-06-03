import { Trip, Place } from '@/types/trip';

// Dynamic import for jsPDF to avoid SSR issues
let jsPDF: any = null;

// Interface for PDF generation options
interface PDFGenerationOptions {
  includeMap?: boolean;
  mapImageUrl?: string;
  format?: 'A4' | 'letter';
}

// Initialize jsPDF
const initializeJsPDF = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (!jsPDF) {
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.jsPDF;
    }
    return true;
  } catch (error) {
    console.warn('jsPDF not available:', error);
    return false;
  }
};

// Check if jsPDF is available
const isJsPDFAvailable = async (): Promise<boolean> => {
  return await initializeJsPDF();
};

// Generate static map URL (placeholder implementation)
const generateStaticMapUrl = (places: Place[], apiKey?: string): string => {
  if (!apiKey) {
    // Return placeholder image URL
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#e5f3e5"/>
        <circle cx="200" cy="150" r="50" fill="#10b981" opacity="0.3"/>
        <text x="200" y="150" text-anchor="middle" dy="0.35em" font-family="Arial" font-size="16" fill="#047857">
          📍 ${places.length} destinations
        </text>
        <text x="200" y="170" text-anchor="middle" dy="0.35em" font-family="Arial" font-size="12" fill="#065f46">
          Sri Lanka Trip Route
        </text>
      </svg>
    `);
  }

  // TODO: Replace with actual Google Static Maps API call
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams({
    size: '400x300',
    maptype: 'roadmap',
    key: apiKey,
    format: 'png'
  });

  // Add markers for each place
  places.forEach((place, index) => {
    params.append('markers', `color:red|label:${index + 1}|${place.lat},${place.lng}`);
  });

  return `${baseUrl}?${params.toString()}`;
};

// Format date for display
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Calculate trip duration
const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// Generate PDF using jsPDF (if available)
export const generateTripPDF = async (
  trip: Trip, 
  options: PDFGenerationOptions = {}
): Promise<void> => {
  const {
    includeMap = true,
    mapImageUrl,
    format = 'A4'
  } = options;

  const pdfAvailable = await isJsPDFAvailable();
  if (!pdfAvailable) {
    // Fallback to HTML print
    console.warn('jsPDF not available, falling back to print functionality');
    printTripItinerary(trip);
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format.toLowerCase()
    });

    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(trip.tripName, margin, yPosition);
    yPosition += 15;

    // Date range and duration
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const duration = calculateDuration(trip.startDate, trip.endDate);
    doc.text(`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Duration: ${duration} days | Districts: ${trip.districts.join(', ')}`, margin, yPosition);
    yPosition += 15;

    // Trip Overview
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Trip Overview', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Status: ${trip.status.replace('_', ' ')}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Total Places: ${trip.places.length}`, margin, yPosition);
    yPosition += 15;

    // Places Table
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Itinerary', margin, yPosition);
    yPosition += 10;

    // Table headers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const colWidths = [15, 60, 40, 35];
    const startX = margin;
    
    doc.text('#', startX, yPosition);
    doc.text('Place Name', startX + colWidths[0], yPosition);
    doc.text('District', startX + colWidths[0] + colWidths[1], yPosition);
    doc.text('Category', startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition);
    yPosition += 8;

    // Draw header line
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
    yPosition += 2;

    // Places data
    doc.setFont('helvetica', 'normal');
    trip.places.forEach((place, index) => {
      if (yPosition > 250) { // Start new page if needed
        doc.addPage();
        yPosition = 20;
      }

      doc.text((index + 1).toString(), startX, yPosition);
      doc.text(place.name, startX + colWidths[0], yPosition);
      doc.text(place.district, startX + colWidths[0] + colWidths[1], yPosition);
      doc.text(place.category, startX + colWidths[0] + colWidths[1] + colWidths[2], yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Add map if requested
    if (includeMap) {
      const staticMapUrl = mapImageUrl || generateStaticMapUrl(trip.places);
      
      try {
        // Add map image
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Route Map', margin, yPosition);
        yPosition += 10;

        // Add placeholder or actual map
        if (staticMapUrl.startsWith('data:image/svg+xml')) {
          // For SVG placeholder, convert to text
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('Map visualization showing your Sri Lanka trip route', margin, yPosition);
          doc.text(`${trip.places.length} destinations across ${trip.districts.length} districts`, margin, yPosition + 6);
          yPosition += 20;
        } else {
          // TODO: Add actual map image when API key is available
          doc.addImage(staticMapUrl, 'PNG', margin, yPosition, 80, 60);
          yPosition += 70;
        }
      } catch (error) {
        console.warn('Could not add map to PDF:', error);
      }
    }


    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text('Sri Lanka Trip Planner', pageWidth - margin - 40, doc.internal.pageSize.getHeight() - 10);
    }

    // Save the PDF
    const fileName = `${trip.tripName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to print
    printTripItinerary(trip);
  }
};

// Generate HTML content for printing
const generatePrintHTML = (trip: Trip): string => {
  const duration = calculateDuration(trip.startDate, trip.endDate);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${trip.tripName} - Itinerary</title>
      <style>
        @media print {
          @page {
            margin: 1in;
            size: A4;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          .print-container {
            max-width: 100%;
            margin: 0;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 25px 0 15px 0;
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
        }
        @media screen {
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .print-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .print-button:hover {
            background: #059669;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button no-print" onclick="window.print()">🖨️ Print Itinerary</button>
      
      <div class="print-container">
        <div class="header">
          <h1>${trip.tripName}</h1>
          <p><strong>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</strong></p>
          <p>Duration: ${duration} days | Districts: ${trip.districts.join(', ')}</p>
          <p>Status: ${trip.status.replace('_', ' ')}</p>
        </div>

        <div class="section-title">Trip Overview</div>
        <p><strong>Total Places:</strong> ${trip.places.length}</p>
        <p><strong>Districts Covered:</strong> ${trip.districts.join(', ')}</p>

        <div class="section-title">Itinerary</div>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">#</th>
              <th style="width: 40%">Place Name</th>
              <th style="width: 25%">District</th>
              <th style="width: 25%">Category</th>
            </tr>
          </thead>
          <tbody>
            ${trip.places.map((place, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${place.name}</td>
                <td>${place.district}</td>
                <td>${place.category}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
          Generated on ${new Date().toLocaleDateString()} | Sri Lanka Trip Planner
        </div>
      </div>
    </body>
    </html>
  `;
};

// Print functionality
export const printTripItinerary = (trip: Trip): void => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow pop-ups to print the itinerary');
    return;
  }

  const htmlContent = generatePrintHTML(trip);
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
};

// Check if PDF generation is supported
export const isPDFGenerationSupported = async (): Promise<boolean> => {
  return await isJsPDFAvailable();
};

// Download itinerary (PDF if available, otherwise print)
export const downloadItinerary = async (trip: Trip, options?: PDFGenerationOptions): Promise<void> => {
  const pdfSupported = await isPDFGenerationSupported();
  if (pdfSupported) {
    await generateTripPDF(trip, options);
  } else {
    console.log('PDF generation not available, opening print dialog');
    printTripItinerary(trip);
  }
};
