declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface UserOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    styles?: any;
    columnStyles?: any;
    margin?: any;
  }
  
  export default function autoTable(doc: jsPDF, options: UserOptions): void;
}
