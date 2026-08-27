// jsPDF (and the html2canvas it drags in) is ~360 kB and is only needed when
// somebody actually submits the brief, so it is loaded at call time rather
// than shipped to every visitor including the login page.
export async function generateBriefPDF(formData, signatureDataUrl) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  let y = 20;

  const ensureSpace = (needed = 10) => {
    if (y > 280 - needed) {
      doc.addPage();
      y = 20;
    }
  };

  const addField = (label, value) => {
    ensureSpace(10);
    doc.setFont(undefined, "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont(undefined, "normal");
    const lines = doc.splitTextToSize(value || "—", 115);
    doc.text(lines, 75, y);
    y += 5 * lines.length + 2;
  };

  const addSection = (title) => {
    y += 4;
    ensureSpace(15);
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.text(title, 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
  };

  const addLongText = (label, value) => {
    ensureSpace(10);
    doc.setFont(undefined, "bold");
    doc.text(`${label}:`, 20, y);
    y += 5;
    doc.setFont(undefined, "normal");
    const lines = doc.splitTextToSize(value || "—", 170);
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, 25, y);
      y += 5;
    }
    y += 2;
  };

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Website Design Client Brief", 20, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont(undefined, "normal");
  doc.text("Orisa Digital", 20, y);
  y += 10;

  // Section 1
  addSection("1. Contact Information");
  addField("Company Name", formData.companyName);
  addField("Contact Person", formData.contactPerson);
  addField("Phone Number", formData.phoneNumber);
  addField("Email Address", formData.emailAddress);
  addField("Website", formData.website);

  // Section 2
  addSection("2. About Your Business");
  addLongText("About Business", formData.aboutBusiness);
  addLongText("Products/Services", formData.productsServices);
  addLongText("Target Customers", formData.targetCustomers);

  // Section 3
  addSection("3. Project Goals");
  addField("Goals", formData.projectGoals.join(", "));
  addLongText("Other", formData.projectGoalsOther);

  // Section 4
  addSection("4. Website Features");
  addField("Features", formData.websiteFeatures.join(", "));
  addLongText("Other", formData.websiteFeaturesOther);

  // Section 5
  addSection("5. Branding & Design");
  addField("Branding Items", formData.brandingItems.join(", "));
  addField("Preferred Style", formData.websiteStyle.join(", "));
  addField("Reference URLs", formData.referenceUrls.filter((u) => u).join(", "));
  addLongText("Likes", formData.likeAboutWebsites);

  // Section 6
  addSection("6. Content");
  addField("Content Provider", formData.contentProvider.join(", "));
  addField("Existing Content", formData.existingContent.join(", "));

  // Section 7
  addSection("7. Domain & Hosting");
  addField("Has Domain", formData.hasDomain === "yes" ? "Yes" : formData.hasDomain === "no" ? "No" : "—");
  if (formData.hasDomain === "yes") {
    addField("Domain Name", formData.domainName);
  }
  addField("Has Hosting", formData.hasHosting === "yes" ? "Yes" : formData.hasHosting === "no" ? "No" : "—");

  // Section 8
  addSection("8. Timeline");
  addField("Preferred Launch Date", formData.launchDate);
  addLongText("Important Deadlines", formData.deadlines);

  // Section 9
  addSection("9. Additional Notes");
  addLongText("Notes", formData.additionalNotes);

  // Declaration
  addSection("Declaration");
  doc.setFont(undefined, "italic");
  const declLines = doc.splitTextToSize("I confirm that the information provided above is accurate to the best of my knowledge.", 170);
  for (const line of declLines) {
    ensureSpace(5);
    doc.text(line, 20, y);
    y += 5;
  }
  doc.setFont(undefined, "normal");
  y += 3;
  addField("Name", formData.declarationName);

  if (signatureDataUrl) {
    ensureSpace(25);
    doc.text("Signature:", 20, y);
    doc.addImage(signatureDataUrl, "PNG", 75, y - 12, 60, 24);
    y += 28;
  }

  addField("Date", formData.declarationDate);

  return doc;
}