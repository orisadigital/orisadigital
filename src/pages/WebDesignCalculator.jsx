import React, { useState } from "react";
import ProjectTypeSection from "@/components/calculator/ProjectTypeSection";
import WhatsIncludedSection from "@/components/calculator/WhatsIncludedSection";
import OnePageIncludedSection from "@/components/calculator/OnePageIncludedSection";
import PagesSection from "@/components/calculator/PagesSection";
import AddOnsSection from "@/components/calculator/AddOnsSection";
import OnePageAddOnsSection from "@/components/calculator/OnePageAddOnsSection";
import DomainSection, { DOMAIN_EXTENSIONS, DOMAIN_SERVICE_CHARGE, DOMAIN_TAX_RATE } from "@/components/calculator/DomainSection";
import HostingSection, { HOSTING_PLANS } from "@/components/calculator/HostingSection";

const LOGO_URL = "https://media.base44.com/images/public/6a66c1df72f6ed66012dc483/0f1493d2a_OrisaLogo2.png";
const SME_BASE_PRICE = 3800;
const ONE_PAGE_BASE_PRICE = 1200;
const EXTRA_PAGE_PRICE = 400;
const BLOG_PRICE = 200;
const EMAIL_SUB_PRICE = 120;
const CPT_PRICE = 150;
const MEGA_MENU_PRICE = 50;
const POPUP_PRICE = 10;
const LANG_PER_PAGE = 25;
const BLOCK_PRICE = 40;
const PAYMENT_GATEWAY_PRICE = 250;

export default function WebDesignCalculator() {
  const [projectType, setProjectType] = useState(null);
  const [pages, setPages] = useState(4);
  const [addOns, setAddOns] = useState({});
  const [options, setOptions] = useState({
    cptCount: 1,
    megaMenuCount: 1,
    popUpCount: 1,
    blocksCount: 1,
    languages: { english: true, malay: false, chinese: false },
  });
  const [domain, setDomain] = useState({ extension: null, duration: 1 });
  const [hosting, setHosting] = useState({ plan: null, duration: 1 });
  const isSME = projectType === "sme";
  const isOnePage = projectType === "one-page";
  const extraPages = Math.max(0, pages - 4);
  const extraPagesCost = extraPages * EXTRA_PAGE_PRICE;
  const selectedLangs = Object.values(options.languages).filter(Boolean).length;
  const additionalLangs = Math.max(0, selectedLangs - 1);
  const blogCost = addOns.blog ? BLOG_PRICE : 0;
  const cptCost = addOns.customPostType ? options.cptCount * CPT_PRICE : 0;
  const megaMenuCost = addOns.megaMenu ? options.megaMenuCount * MEGA_MENU_PRICE : 0;
  const popUpCost = addOns.popUpCall ? options.popUpCount * POPUP_PRICE : 0;
  const multiLangCost = addOns.multiLanguage ? additionalLangs * pages * LANG_PER_PAGE : 0;
  const onePageMultiLangCost = addOns.multiLanguage ? additionalLangs * LANG_PER_PAGE : 0;
  const emailSubCost = addOns.emailSubscription ? EMAIL_SUB_PRICE : 0;
  const blocksCost = addOns.contentBlocks ? options.blocksCount * BLOCK_PRICE : 0;
  const paymentGatewayCost = addOns.paymentGateway ? PAYMENT_GATEWAY_PRICE : 0;
  const smEAddOnsTotal = blogCost + cptCost + megaMenuCost + popUpCost + multiLangCost + emailSubCost;
  const onePageAddOnsTotal = blocksCost + blogCost + cptCost + onePageMultiLangCost + popUpCost + emailSubCost + paymentGatewayCost;
  const selectedDomainExt = DOMAIN_EXTENSIONS.find((e) => e.id === domain.extension);
  const domainPrice = selectedDomainExt ? selectedDomainExt.price * domain.duration : 0;
  const domainTax = domainPrice * DOMAIN_TAX_RATE;
  const domainTotal = selectedDomainExt ? domainPrice + domainTax + DOMAIN_SERVICE_CHARGE : 0;
  const selectedHostingPlan = HOSTING_PLANS.find((p) => p.id === hosting.plan);
  const hostingTotal = selectedHostingPlan ? selectedHostingPlan.prices[hosting.duration] : 0;
  const total = isSME
    ? SME_BASE_PRICE + extraPagesCost + smEAddOnsTotal + domainTotal + hostingTotal
    : isOnePage
    ? ONE_PAGE_BASE_PRICE + onePageAddOnsTotal + domainTotal + hostingTotal
    : 0;
  const formatTotal = (val) => val % 1 === 0 ? val.toLocaleString() : val.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const showSummary = isSME || isOnePage;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16 sm:px-8">
        <div className="flex justify-center mb-10">
          <img src={LOGO_URL} alt="Orisa Digital" className="h-16 w-auto" />
        </div>
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight font-display">
            Web Design Calculator
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Estimate your website project cost in a few simple steps.
          </p>
        </header>
        <div>
          <ProjectTypeSection value={projectType} onChange={setProjectType} />
          {isSME && (
            <>
              <WhatsIncludedSection />
              <PagesSection pages={pages} onChange={setPages} extraPagePrice={EXTRA_PAGE_PRICE} />
              <AddOnsSection addOns={addOns} onChange={setAddOns} options={options} setOptions={setOptions} pages={pages} />
              <DomainSection domain={domain} onChange={setDomain} />
              <HostingSection hosting={hosting} onChange={setHosting} />
            </>
          )}
          {isOnePage && (
            <>
              <OnePageIncludedSection />
              <OnePageAddOnsSection addOns={addOns} onChange={setAddOns} options={options} setOptions={setOptions} />
              <DomainSection domain={domain} onChange={setDomain} sectionNumber="04" />
              <HostingSection hosting={hosting} onChange={setHosting} plans={[HOSTING_PLANS[0]]} sectionNumber="05" />
            </>
          )}
        </div>
        {showSummary && (
          <div className="mt-8 rounded-2xl border-2 border-slate-900 bg-slate-50 p-6">
            <p className="text-xs text-slate-500">Estimated Total</p>
            <p className="text-3xl font-bold text-slate-900">RM{formatTotal(total)}</p>
            <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-0.5">
              {isSME && <p>SMEs Website: RM{SME_BASE_PRICE.toLocaleString()}</p>}
              {isOnePage && <p>One Page Website: RM{ONE_PAGE_BASE_PRICE.toLocaleString()}</p>}
              {extraPages > 0 && isSME && <p>Extra pages ({extraPages}): RM{extraPagesCost.toLocaleString()}</p>}
              {addOns.contentBlocks && isOnePage && <p>Content Blocks ({options.blocksCount}): RM{blocksCost.toLocaleString()}</p>}
              {addOns.blog && <p>Blog: RM{blogCost.toLocaleString()}</p>}
              {addOns.customPostType && <p>Custom Post Type ({options.cptCount}): RM{cptCost.toLocaleString()}</p>}
              {addOns.megaMenu && isSME && <p>Mega Menu ({options.megaMenuCount}): RM{megaMenuCost.toLocaleString()}</p>}
              {addOns.multiLanguage && additionalLangs > 0 && (
                <p>Multi Language ({additionalLangs}): RM{(isSME ? multiLangCost : onePageMultiLangCost).toLocaleString()}</p>
              )}
              {addOns.popUpCall && <p>Pop Up Call ({options.popUpCount}): RM{popUpCost.toLocaleString()}</p>}
              {addOns.emailSubscription && <p>Email Subscription: RM{emailSubCost.toLocaleString()}</p>}
              {addOns.paymentGateway && isOnePage && <p>Payment Gateway: RM{paymentGatewayCost.toLocaleString()}</p>}
              {domainTotal > 0 && <p>Domain ({selectedDomainExt.label}, {domain.duration}yr): RM{domainTotal.toFixed(2)}</p>}
              {hostingTotal > 0 && <p>Hosting ({selectedHostingPlan.title}, {hosting.duration}yr): RM{hostingTotal.toLocaleString()}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}