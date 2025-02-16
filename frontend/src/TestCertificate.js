import React from "react";
import jsPDF from "jspdf";

const TestCertificate = () => {
  const generateCertificate = () => {
    const userName = "John Doe"; // Test Name
    const score = 9;
    const totalQuestions = 10;
    
    const doc = new jsPDF("landscape");

    // 🎨 **Elegant Light Gradient Background**
    const gradient =
      doc.createLinearGradient(0, 0, 297, 210, [
        [0, "#f8f8f8"],
        [1, "#e3e3e3"],
      ]);
    doc.setFillColor(gradient);
    doc.rect(0, 0, 297, 210, "F");

    // 🏆 **Modern Border - Dual Tone**
    doc.setDrawColor(80, 120, 200); // Deep Blue
    doc.setLineWidth(5);
    doc.rect(12, 12, 273, 186);

    doc.setDrawColor(180, 180, 180); // Inner Border
    doc.setLineWidth(2);
    doc.rect(20, 20, 257, 170);

    // 🏆 **Premium Title**
    doc.setFont("times", "bold");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(40);
    doc.text("CERTIFICATE OF COMPLETION", 148, 50, { align: "center" });

    // 📜 **Subtitle**
    doc.setFont("helvetica", "italic");
    doc.setFontSize(18);
    doc.setTextColor(70, 70, 70);
    doc.text("This certificate is proudly presented to", 148, 75, {
      align: "center",
    });

    // ✍️ **Recipient Name**
    doc.setFont("cursive", "bolditalic");
    doc.setFontSize(36);
    doc.setTextColor(50, 90, 160);
    doc.text(userName, 148, 100, { align: "center" });

    // 🎖 **Achievement Details**
    doc.setFont("helvetica", "normal");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(
      `For achieving a score of ${score}/${totalQuestions} in the React Certification Exam.`,
      148,
      130,
      { align: "center", maxWidth: 250 }
    );

    // 📅 **Issue Date**
    const issueDate = new Date().toLocaleDateString();
    doc.setFontSize(16);
    doc.setTextColor(120, 120, 120);
    doc.text(`Issued on: ${issueDate}`, 148, 150, { align: "center" });

    // ✍️ **Signature - "Uni-Conn"**
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(1);
    doc.line(100, 180, 190, 180);
    doc.setFont("cursive", "bolditalic");
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text("Uni-Conn", 148, 190, { align: "center" });

    // 🌊 **Subtle Watermark**
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(50);
    doc.text("UNIVERSITY CONNECT", 148, 120, {
      align: "center",
      opacity: 0.1,
      rotate: 30,
    });

    // 💾 **Save PDF**
    doc.save(`${userName}_Test_Certificate.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">📜 Test Certificate Generator</h1>
      <button
        onClick={generateCertificate}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
      >
        🎓 Generate Test Certificate
      </button>
    </div>
  );
};

export default TestCertificate;
