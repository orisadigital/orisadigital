import React from "react";
import { CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessMessage({ pdfUrl }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight font-display">
          Thank You!
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          We've received your website design brief.
        </p>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          Our team will review your requirements and contact you within 1–2 business days to discuss your project.
        </p>
        <div className="mt-8">
          <p className="text-sm text-slate-500 leading-relaxed mb-4">
            Download a copy of your submitted brief for your records.
          </p>
          <Button asChild className="text-base py-6">
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Download Your Brief
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}