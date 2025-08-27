// ResumeExport.js
// This file contains alternative export methods for the resume

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * A fallback method for PDF generation using a different approach
 * that works in more scenarios than the main method
 */
export const generatePDFWithFallback = async (element, filename, options = {}) => {
  console.log("Using fallback PDF generation method");
  
  if (!element) {
    throw new Error("No element provided for PDF generation");
  }
  
  // Prepare element for capture
  // Store original styles for reference (can be used for restoration if needed)
  // const originalStyles = {
  //   position: element.style.position,
  //   top: element.style.top,
  //   left: element.style.left,
  //   margin: element.style.margin,
  //   padding: element.style.padding
  // };
  
  // Apply capture-friendly styles
  const captureStyles = {
    position: "absolute",
    top: "0",
    left: "0",
    margin: "0",
    padding: "0"
  };
  
  // Clone the element to avoid affecting the original
  const clone = element.cloneNode(true);
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "800px"; // Set consistent width for A4 ratio
  container.style.background = "white";
  container.appendChild(clone);
  document.body.appendChild(container);
  
  try {
    // Apply styles to cloned element
    Object.assign(clone.style, captureStyles);
    
    // Set options
    const config = {
      scale: options.scale || 2,
      useCORS: true,
      allowTaint: true,
      logging: true,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
      // Remove elements that might cause issues
      onclone: (clonedDoc) => {
        const problemElements = clonedDoc.querySelectorAll('iframe, canvas, video');
        problemElements.forEach(el => el.remove());
        return clonedDoc;
      }
    };
    
    // Generate canvas
    const canvas = await html2canvas(clone, config);
    const imgData = canvas.toDataURL("image/png", 1.0);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate proper scaling
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    
    // Center the image
    const x = (pdfWidth - scaledWidth) / 2;
    const y = 0;
    
    // Add image to PDF
    pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);
    
    // Save PDF
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error("Error in fallback PDF generation:", error);
    throw error;
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};

/**
 * Alternative method using SVG rendering for better quality
 * This is a more experimental approach that works in some cases
 * where canvas-based approaches fail
 */
export const generatePDFFromSVG = async (element, filename) => {
  console.log("Using SVG-based PDF generation method");
  
  return new Promise((resolve, reject) => {
    try {
      // Use html2canvas first to capture styles and layout more reliably
      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000
      }).then(canvas => {
        try {
          // Convert canvas to image data
          const imgData = canvas.toDataURL('image/png');
          
          // Create PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          // Get page dimensions
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Calculate ratio to fit the canvas to the page
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          
          // Scale dimensions
          const scaledWidth = imgWidth * ratio;
          const scaledHeight = imgHeight * ratio;
          
          // Center the image
          const x = (pdfWidth - scaledWidth) / 2;
          const y = 0;
          
          // Add the image to the PDF
          pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
          
          // Save the PDF with the provided filename
          pdf.save(filename);
          
          resolve(true);
        } catch (pdfError) {
          console.error("Error generating PDF from canvas:", pdfError);
          reject(pdfError);
        }
      }).catch(canvasError => {
        console.error("Error generating canvas:", canvasError);
        reject(canvasError);
      });
    } catch (error) {
      console.error("Error in SVG PDF generation:", error);
      reject(error);
    }
  });
};

/**
 * Method for exporting resume to HTML file directly
 * This can be used as a last resort if PDF generation fails
 */
export const exportToHTML = (element, filename) => {
  console.log("Exporting resume as HTML");
  try {
    // Extract styles from the page
    const getPageStyles = () => {
      let styles = '';
      const styleSheets = document.styleSheets;
      
      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const cssRules = styleSheets[i].cssRules || styleSheets[i].rules;
          if (cssRules) {
            for (let j = 0; j < cssRules.length; j++) {
              styles += cssRules[j].cssText;
            }
          }
        } catch (e) {
          console.warn('Error accessing stylesheet rules:', e);
        }
      }
      
      return styles;
    };
    
    // Get computed styles for the element
    const getComputedStyles = (el) => {
      const computedStyle = window.getComputedStyle(el);
      let styles = '';
      
      for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i];
        const value = computedStyle.getPropertyValue(prop);
        styles += `${prop}: ${value}; `;
      }
      
      return styles;
    };
    
    // Create HTML content
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resume</title>
        <style>
          ${getPageStyles()}
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
          }
          .resume-container {
            width: 8.27in;
            height: 11.69in;
            margin: 0 auto;
            padding: 0.5in;
            box-sizing: border-box;
            ${getComputedStyles(element)}
          }
          @media print {
            body {
              width: 8.27in;
              height: 11.69in;
            }
            .resume-container {
              padding: 0;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          ${element.innerHTML}
        </div>
        <script>
          // Show print dialog automatically when loaded
          window.onload = function() {
            // Small delay to ensure all assets are loaded
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Create blob
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace('.pdf', '.html');
    a.click();
    
    // Clean up after a delay to ensure the browser has time to process
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.error("Error exporting to HTML:", error);
    throw error;
  }
};
