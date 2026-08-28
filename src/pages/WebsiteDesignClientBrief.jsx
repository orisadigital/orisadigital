import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import SignaturePad from "@/components/SignaturePad";
import SuccessMessage from "@/components/SuccessMessage";
import { generateBriefPDF } from "@/lib/generateBriefPDF";
import { base44 } from "@/api/base44Client";

const LOGO_URL = "https://media.base44.com/images/public/6a66c1df72f6ed66012dc483/a51f59b27_OrisaLogo2.png";

const CheckboxGrid = ({ items, selected = [], onToggle, columns = 2 }) => (
  <div className={`grid grid-cols-1 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
    {items.map((item) => {
      const id = item.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      return (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox
            id={id}
            checked={selected.includes(item)}
            onCheckedChange={() => onToggle(item)}
          />
          <Label htmlFor={id} className="text-sm font-normal cursor-pointer">
            {item}
          </Label>
        </div>
      );
    })}
  </div>
);

const Field = ({ label, optional, error, children }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-slate-700">
      {label} {optional ? <span className="text-slate-400 font-normal">(Optional)</span> : <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const Section = ({ number, title, children }) => (
  <section className="pt-8 border-t border-slate-200 first:border-t-0 first:pt-0">
    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
      {number}. {title}
    </h2>
    <div className="mt-5 space-y-5">{children}</div>
  </section>
);

const INITIAL_DATA = {
  companyName: "",
  contactPerson: "",
  phoneNumber: "",
  emailAddress: "",
  website: "",
  aboutBusiness: "",
  productsServices: "",
  targetCustomers: "",
  projectGoals: [],
  projectGoalsOther: "",
  websiteFeatures: [],
  websiteFeaturesOther: "",
  brandingItems: [],
  websiteStyle: [],
  referenceUrls: ["", "", ""],
  likeAboutWebsites: "",
  contentProvider: [],
  existingContent: [],
  hasDomain: "",
  domainName: "",
  hasHosting: "",
  launchDate: "",
  deadlines: "",
  additionalNotes: "",
  declarationName: "",
  declarationDate: "",
};

export default function WebsiteDesignClientBrief() {
  const [formData, setFormData] = useState(INITIAL_DATA);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const signatureRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleCheckbox = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleUrlChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      referenceUrls: prev.referenceUrls.map((url, i) => (i === index ? value : url)),
    }));
  };

  const validate = () => {
    const e = {};
    if (!formData.companyName.trim()) e.companyName = "Company name is required";
    if (!formData.contactPerson.trim()) e.contactPerson = "Contact person is required";
    if (!formData.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
    if (!formData.emailAddress.trim()) e.emailAddress = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) e.emailAddress = "Please enter a valid email";
    if (!formData.declarationName.trim()) e.declarationName = "Name is required";
    if (!formData.declarationDate) e.declarationDate = "Date is required";
    if (!signatureRef.current?.hasSignature) e.signature = "Please sign the declaration";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorEl = document.querySelector("[data-error='true']");
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const signatureDataUrl = signatureRef.current?.getDataURL();
      const doc = await generateBriefPDF(formData, signatureDataUrl);
      const pdfBlob = doc.output("blob");
      const file = new File([pdfBlob], "website-design-brief.pdf", { type: "application/pdf" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const summary = [
        `*New Website Design Brief*`,
        ``,
        `*Company:* ${formData.companyName}`,
        `*Contact:* ${formData.contactPerson}`,
        `*Email:* ${formData.emailAddress}`,
        `*Phone:* ${formData.phoneNumber}`,
        `*Website:* ${formData.website || "—"}`,
        ``,
        `*About Business:* ${formData.aboutBusiness || "—"}`,
        `*Products/Services:* ${formData.productsServices || "—"}`,
        `*Target Customers:* ${formData.targetCustomers || "—"}`,
        ``,
        `*Project Goals:* ${formData.projectGoals.join(", ") || "—"}`,
        `*Goals (Other):* ${formData.projectGoalsOther || "—"}`,
        `*Website Features:* ${formData.websiteFeatures.join(", ") || "—"}`,
        `*Features (Other):* ${formData.websiteFeaturesOther || "—"}`,
        ``,
        `*Branding Items:* ${formData.brandingItems.join(", ") || "—"}`,
        `*Preferred Style:* ${formData.websiteStyle.join(", ") || "—"}`,
        `*Reference URLs:* ${formData.referenceUrls.filter(u => u).join(", ") || "—"}`,
        `*Likes:* ${formData.likeAboutWebsites || "—"}`,
        ``,
        `*Content Provider:* ${formData.contentProvider.join(", ") || "—"}`,
        `*Existing Content:* ${formData.existingContent.join(", ") || "—"}`,
        ``,
        `*Has Domain:* ${formData.hasDomain || "—"}`,
        `*Domain Name:* ${formData.domainName || "—"}`,
        `*Has Hosting:* ${formData.hasHosting || "—"}`,
        `*Preferred Launch Date:* ${formData.launchDate || "—"}`,
        `*Deadlines:* ${formData.deadlines || "—"}`,
        ``,
        `*Additional Notes:* ${formData.additionalNotes || "—"}`,
        `*Declaration Name:* ${formData.declarationName}`,
        `*Declaration Date:* ${formData.declarationDate}`,
        ``,
        `*Brief PDF:* ${file_url}`,
      ].join("\n");

      const whatsappUrl = `https://wa.me/60139975304?text=${encodeURIComponent(summary)}`;
      window.open(whatsappUrl, "_blank");

      setSubmitted(file_url);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError("Something went wrong submitting your brief. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return <SuccessMessage pdfUrl={submitted} />;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:px-8">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src={LOGO_URL} alt="Orisa Digital" className="h-16 w-auto rounded-lg" />
        </div>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight font-display">
            Website Design Client Brief
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Thank you for choosing Orisa Digital. Please complete this form to help us understand
            your business and website requirements.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Section 1 */}
          <Section number={1} title="Contact Information">
            <Field label="Company Name" error={errors.companyName}>
              <div data-error={errors.companyName ? "true" : undefined}>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Your company name"
                />
              </div>
            </Field>
            <Field label="Contact Person" error={errors.contactPerson}>
              <div data-error={errors.contactPerson ? "true" : undefined}>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                  placeholder="Full name"
                />
              </div>
            </Field>
            <Field label="Phone Number" error={errors.phoneNumber}>
              <div data-error={errors.phoneNumber ? "true" : undefined}>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </Field>
            <Field label="Email Address" error={errors.emailAddress}>
              <div data-error={errors.emailAddress ? "true" : undefined}>
                <Input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleChange("emailAddress", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </Field>
            <Field label="Website" optional>
              <Input
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="www.example.com"
              />
            </Field>
          </Section>

          {/* Section 2 */}
          <Section number={2} title="About Your Business">
            <Field label="Tell us about your business">
              <Textarea
                value={formData.aboutBusiness}
                onChange={(e) => handleChange("aboutBusiness", e.target.value)}
                placeholder="Describe your business, industry, and what you do..."
                rows={4}
              />
            </Field>
            <Field label="What products or services do you provide?">
              <Textarea
                value={formData.productsServices}
                onChange={(e) => handleChange("productsServices", e.target.value)}
                placeholder="List your main products or services..."
                rows={4}
              />
            </Field>
            <Field label="Who are your target customers?">
              <Textarea
                value={formData.targetCustomers}
                onChange={(e) => handleChange("targetCustomers", e.target.value)}
                placeholder="Describe your ideal customers, demographics, etc..."
                rows={4}
              />
            </Field>
          </Section>

          {/* Section 3 */}
          <Section number={3} title="Project Goals">
            <Field label="What would you like your website to achieve?">
              <CheckboxGrid
                items={["Increase Enquiries", "Generate Leads", "Sell Products Online", "Showcase Company Profile", "Promote Services", "Build Brand Credibility", "Share News or Updates"]}
                selected={formData.projectGoals}
                onToggle={(v) => toggleCheckbox("projectGoals", v)}
              />
            </Field>
            <Field label="Other" optional>
              <Textarea
                value={formData.projectGoalsOther}
                onChange={(e) => handleChange("projectGoalsOther", e.target.value)}
                placeholder="Any other goals you'd like to share..."
                rows={3}
              />
            </Field>
          </Section>

          {/* Section 4 */}
          <Section number={4} title="Website Features">
            <Field label="Select the features you require.">
              <CheckboxGrid
                items={["Contact Form", "WhatsApp Chat", "Google Maps", "Photo Gallery", "Video Gallery", "Testimonials", "Download Brochure/PDF", "Newsletter Signup", "Appointment Booking", "Online Payment", "E-commerce Store", "User Login", "Multi-Language", "Live Chat", "AI Chatbot", "Search Function"]}
                selected={formData.websiteFeatures}
                onToggle={(v) => toggleCheckbox("websiteFeatures", v)}
              />
            </Field>
            <Field label="Other" optional>
              <Textarea
                value={formData.websiteFeaturesOther}
                onChange={(e) => handleChange("websiteFeaturesOther", e.target.value)}
                placeholder="Any other features you need..."
                rows={3}
              />
            </Field>
          </Section>

          {/* Section 5 */}
          <Section number={5} title="Branding & Design">
            <Field label="Do you have the following?">
              <CheckboxGrid
                items={["Logo", "Brand Guidelines", "Company Profile", "Product Photos", "Videos", "Existing Website"]}
                selected={formData.brandingItems}
                onToggle={(v) => toggleCheckbox("brandingItems", v)}
                columns={3}
              />
            </Field>
            <Field label="Preferred website style">
              <CheckboxGrid
                items={["Modern", "Minimalist", "Corporate", "Premium", "Luxury", "Creative", "Clean"]}
                selected={formData.websiteStyle}
                onToggle={(v) => toggleCheckbox("websiteStyle", v)}
                columns={3}
              />
            </Field>
            <Field label="Please share websites you like" optional>
              <Input value={formData.referenceUrls[0]} onChange={(e) => handleUrlChange(0, e.target.value)} placeholder="URL 1" />
              <Input value={formData.referenceUrls[1]} onChange={(e) => handleUrlChange(1, e.target.value)} placeholder="URL 2" />
              <Input value={formData.referenceUrls[2]} onChange={(e) => handleUrlChange(2, e.target.value)} placeholder="URL 3" />
            </Field>
            <Field label="What do you like about these websites?" optional>
              <Textarea
                value={formData.likeAboutWebsites}
                onChange={(e) => handleChange("likeAboutWebsites", e.target.value)}
                placeholder="Describe what you like about these websites..."
                rows={4}
              />
            </Field>
          </Section>

          {/* Section 6 */}
          <Section number={6} title="Content">
            <Field label="Who will provide the website content?">
              <CheckboxGrid
                items={["Client", "Orisa Digital", "Both"]}
                selected={formData.contentProvider}
                onToggle={(v) => toggleCheckbox("contentProvider", v)}
                columns={3}
              />
            </Field>
            <Field label="Do you already have?">
              <CheckboxGrid
                items={["Company Introduction", "Service Descriptions", "Product Information", "Images", "Video", "Testimonials"]}
                selected={formData.existingContent}
                onToggle={(v) => toggleCheckbox("existingContent", v)}
                columns={3}
              />
            </Field>
          </Section>

          {/* Section 7 */}
          <Section number={7} title="Domain & Hosting">
            <Field label="Do you already have a domain name?">
              <RadioGroup value={formData.hasDomain} onValueChange={(v) => handleChange("hasDomain", v)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="domain-yes" />
                  <Label htmlFor="domain-yes" className="text-sm font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="domain-no" />
                  <Label htmlFor="domain-no" className="text-sm font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </Field>
            {formData.hasDomain === "yes" && (
              <Field label="Domain Name">
                <Input
                  value={formData.domainName}
                  onChange={(e) => handleChange("domainName", e.target.value)}
                  placeholder="www.yourdomain.com"
                />
              </Field>
            )}
            <Field label="Do you already have web hosting?">
              <RadioGroup value={formData.hasHosting} onValueChange={(v) => handleChange("hasHosting", v)} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="hosting-yes" />
                  <Label htmlFor="hosting-yes" className="text-sm font-normal cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="hosting-no" />
                  <Label htmlFor="hosting-no" className="text-sm font-normal cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </Field>
          </Section>

          {/* Section 8 */}
          <Section number={8} title="Timeline">
            <Field label="Preferred launch date">
              <Input
                type="date"
                value={formData.launchDate}
                onChange={(e) => handleChange("launchDate", e.target.value)}
              />
            </Field>
            <Field label="Are there any important deadlines?" optional>
              <Textarea
                value={formData.deadlines}
                onChange={(e) => handleChange("deadlines", e.target.value)}
                placeholder="List any key dates or deadlines..."
                rows={3}
              />
            </Field>
          </Section>

          {/* Section 9 */}
          <Section number={9} title="Additional Notes">
            <Field label="Anything else you'd like us to know about your project?" optional>
              <Textarea
                value={formData.additionalNotes}
                onChange={(e) => handleChange("additionalNotes", e.target.value)}
                placeholder="Share any additional details..."
                rows={4}
              />
            </Field>
          </Section>

          {/* Declaration */}
          <section className="pt-8 border-t-2 border-slate-300">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Declaration</h2>
            <p className="mt-3 text-sm text-slate-600 italic leading-relaxed">
              I confirm that the information provided above is accurate to the best of my knowledge.
            </p>
            <div className="mt-5 space-y-5">
              <Field label="Name" error={errors.declarationName}>
                <div data-error={errors.declarationName ? "true" : undefined}>
                  <Input
                    value={formData.declarationName}
                    onChange={(e) => handleChange("declarationName", e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
              </Field>
              <Field label="Signature" error={errors.signature}>
                <div data-error={errors.signature ? "true" : undefined}>
                  <SignaturePad ref={signatureRef} />
                </div>
              </Field>
              <Field label="Date" error={errors.declarationDate}>
                <div data-error={errors.declarationDate ? "true" : undefined}>
                  <Input
                    type="date"
                    value={formData.declarationDate}
                    onChange={(e) => handleChange("declarationDate", e.target.value)}
                  />
                </div>
              </Field>
            </div>
          </section>

          {/* Submit */}
          {submitError && (
            <p className="text-sm text-red-500 text-center pt-6">{submitError}</p>
          )}
          <div className="pt-8">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full text-base py-6"
            >
              {submitting ? (
                <>
                  Submitting...
                </>
              ) : (
                <>
                  <WhatsAppIcon className="h-5 w-5 mr-2" />
                  Submit Brief
                </>
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-slate-500 leading-relaxed">
              Click "Submit Brief" to send your details to Orisa Digital via WhatsApp.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}