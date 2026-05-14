import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF Generator for School ID Cards
 */

const PAPER_SIZES = {
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 }
};

const CARD_SIZE = {
  width: 54,
  height: 86,
  margin: 2
};

export const generateStudentIDsPDF = async ({ 
  students, 
  school, 
  paperSize = 'A5', 
  renderCard // Callback to render a single card component
}) => {
  const size = PAPER_SIZES[paperSize] || PAPER_SIZES.A5;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize.toLowerCase()
  });

  const cardsPerPageX = Math.floor(size.width / (CARD_SIZE.width + CARD_SIZE.margin * 2));
  const cardsPerPageY = Math.floor(size.height / (CARD_SIZE.height + CARD_SIZE.margin * 2));
  const cardsPerPage = cardsPerPageX * cardsPerPageY;

  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const pageIndex = Math.floor(i / cardsPerPage);
    const cardIndexInPage = i % cardsPerPage;
    
    if (cardIndexInPage === 0 && i !== 0) {
      pdf.addPage();
    }

    const col = cardIndexInPage % cardsPerPageX;
    const row = Math.floor(cardIndexInPage / cardsPerPageX);

    const x = col * (CARD_SIZE.width + CARD_SIZE.margin * 2) + CARD_SIZE.margin;
    const y = row * (CARD_SIZE.height + CARD_SIZE.margin * 2) + CARD_SIZE.margin;

    // Render card to container
    const cardElement = renderCard(student, school);
    container.appendChild(cardElement);

    // Wait for images to load if any
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(cardElement, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', x, y, CARD_SIZE.width, CARD_SIZE.height);
    
    // Remove from DOM to keep it clean
    container.removeChild(cardElement);
  }

  document.body.removeChild(container);
  pdf.save(`ID_Cards_${school.name.replace(/\s+/g, '_')}_${paperSize}.pdf`);
};
