// Enhanced Export Service - Handle multiple export formats
// Supports JSON, CSV, PDF, and more

class ExportService {
  // Export data as JSON
  static exportAsJSON(data, filename = "export") {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      this.downloadFile(blob, `${filename}.json`);
      return true;
    } catch (error) {
      console.error("Error exporting JSON:", error);
      return false;
    }
  }

  // Export data as CSV
  static exportAsCSV(data, filename = "export") {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("No data to export");
        return false;
      }

      const headers = Object.keys(data[0]);
      const rows = data.map((row) =>
        headers
          .map((header) => this.escapeCSVField(row[header]))
          .join(",")
      );

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      this.downloadFile(blob, `${filename}.csv`);
      return true;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      return false;
    }
  }

  // Export data as XLSX (requires library like xlsx)
  static async exportAsXLSX(data, filename = "export") {
    try {
      // Dynamic import to keep bundle size small
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      return true;
    } catch (error) {
      console.error("Error exporting XLSX:", error);
      return false;
    }
  }

  // Export resume as PDF
  static async exportResumePDF(resumeData) {
    try {
      // Dynamic import for PDF library
      const jsPDF = await import("jspdf");
      const html2Canvas = await import("html2canvas");

      // Create PDF with resume data
      const pdf = new jsPDF.jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add content to PDF (simplified version)
      pdf.setFontSize(20);
      pdf.text(resumeData.fullName || "Resume", 10, 10);

      pdf.setFontSize(12);
      pdf.text(`Email: ${resumeData.email || "N/A"}`, 10, 20);
      pdf.text(`Phone: ${resumeData.phone || "N/A"}`, 10, 30);

      // Add more sections as needed
      const downloadDate = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${downloadDate}`, 10, pageHeight - 10);

      pdf.save(`${resumeData.fullName || "resume"}.pdf`);
      return true;
    } catch (error) {
      console.error("Error exporting PDF:", error);
      // Fallback to simple text file
      this.exportAsText(resumeData, "resume_backup");
      return false;
    }
  }

  // Export as plain text
  static exportAsText(data, filename = "export") {
    try {
      let text = "";
      if (typeof data === "string") {
        text = data;
      } else {
        text = JSON.stringify(data, null, 2);
      }

      const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
      this.downloadFile(blob, `${filename}.txt`);
      return true;
    } catch (error) {
      console.error("Error exporting text:", error);
      return false;
    }
  }

  // Export career plan
  static exportCareerPlan(planData) {
    const filename = `career_plan_${new Date().getFullYear()}`;
    return this.exportAsJSON(planData, filename);
  }

  // Export projects portfolio
  static exportPortfolio(projects) {
    const portfolio = {
      generatedAt: new Date().toISOString(),
      totalProjects: projects.length,
      projects: projects,
    };
    return this.exportAsJSON(portfolio, "portfolio");
  }

  // Export bookmarks/favorites
  static exportBookmarks(bookmarks) {
    const bookmarkData = bookmarks.map((b) => ({
      title: b.title,
      url: b.url,
      category: b.category,
      addedAt: b.addedAt,
      notes: b.notes || "",
    }));
    return this.exportAsJSON(bookmarkData, "bookmarks");
  }

  // Export achievements/certificate
  static generateCertificate(userName, skill, date = new Date()) {
    const certificate = {
      recipientName: userName,
      skill: skill,
      issuedDate: date.toLocaleDateString(),
      certificateId: `CERT-${Date.now()}`,
      issuer: "MapOut Platform",
    };

    // Export as JSON
    this.exportAsJSON(certificate, `certificate-${skill.replace(/\s/g, "_")}`);
  }

  // Generate skill report
  static generateSkillReport(skills) {
    const report = {
      generatedAt: new Date().toISOString(),
      totalSkills: skills.length,
      skillsByCategory: this.groupSkillsByCategory(skills),
      skills: skills.sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0)),
    };
    return this.exportAsJSON(report, "skill_report");
  }

  // Export analytics/progress report
  static exportAnalytics(analyticsData) {
    const report = {
      generatedAt: new Date().toISOString(),
      ...analyticsData,
    };
    return this.exportAsJSON(report, "analytics_report");
  }

  // Create shareable link (for server-side implementation)
  static async getShareableLink(data, expiryDays = 7) {
    try {
      const response = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data,
          expiresIn: expiryDays * 24 * 60 * 60,
        }),
      });

      if (!response.ok) throw new Error("Failed to create shareable link");
      const { shareToken } = await response.json();
      return `${window.location.origin}/download/${shareToken}`;
    } catch (error) {
      console.error("Error creating shareable link:", error);
      return null;
    }
  }

  // Helper: Download file
  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Helper: Escape CSV field
  static escapeCSVField(field) {
    if (field === null || field === undefined) return '""';
    const str = field.toString();
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // Helper: Group skills by category
  static groupSkillsByCategory(skills) {
    return skills.reduce((acc, skill) => {
      const category = skill.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill.name);
      return acc;
    }, {});
  }

  // Copy to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      return false;
    }
  }

  // Print document
  static printDocument(title = "Document") {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Print functionality</p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

// Legacy exports for backward compatibility
export const exportAsJSON = (data, filename) =>
  ExportService.exportAsJSON(data, filename);
export const exportAsCSV = (data, filename) =>
  ExportService.exportAsCSV(data, filename);
export const exportResumePDF = (resumeData) =>
  ExportService.exportResumePDF(resumeData);
export const exportCareerPlan = (planData) =>
  ExportService.exportCareerPlan(planData);
export const generateCertificate = (userName, skill) =>
  ExportService.generateCertificate(userName, skill);

export default ExportService;
