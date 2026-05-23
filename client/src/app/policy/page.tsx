'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Scale, RotateCcw, ShieldCheck, FileText, ChevronRight } from 'lucide-react'

type TabType = 'return' | 'terms' | 'security' | 'privacy'

function PolicyPortal() {
  const params = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('return')

  useEffect(() => {
    const t = params.get('tab') as TabType
    if (['return', 'terms', 'security', 'privacy'].includes(t)) {
      setActiveTab(t)
    }
  }, [params])

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between">
      <div>
        <Header />
        <main className="max-w-5xl mx-auto px-4 py-8">
          
          {/* Header Banner */}
          <div className="bg-[#172337] rounded-lg p-8 text-white mb-8 shadow-md">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">EasyShop Policies &amp; Legal Center</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Please review the terms of use, privacy statements, return processes, and security standards of our marketplace.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-60 shrink-0">
              <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <button onClick={() => setActiveTab('return')}
                  className={`flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'return' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="flex items-center gap-2.5"><RotateCcw size={16} /> Return Policy</span>
                  <ChevronRight size={14} className="hidden md:block opacity-60" />
                </button>
                <button onClick={() => setActiveTab('terms')}
                  className={`flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'terms' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="flex items-center gap-2.5"><FileText size={16} /> Terms Of Use</span>
                  <ChevronRight size={14} className="hidden md:block opacity-60" />
                </button>
                <button onClick={() => setActiveTab('security')}
                  className={`flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'security' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="flex items-center gap-2.5"><ShieldCheck size={16} /> Security</span>
                  <ChevronRight size={14} className="hidden md:block opacity-60" />
                </button>
                <button onClick={() => setActiveTab('privacy')}
                  className={`flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-semibold rounded transition-colors text-left whitespace-nowrap w-full ${
                    activeTab === 'privacy' ? 'bg-blue-50 text-[#2874f0]' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="flex items-center gap-2.5"><Scale size={16} /> Privacy Policy</span>
                  <ChevronRight size={14} className="hidden md:block opacity-60" />
                </button>
              </nav>
            </aside>

            {/* Content Area */}
            <article className="flex-1 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px] text-gray-700 text-sm leading-relaxed space-y-6">
              
              {/* Return Policy */}
              {activeTab === 'return' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <RotateCcw className="text-[#2874f0]" size={20} /> 10-Day Return &amp; Exchange Policy
                  </h2>
                  <p>
                    EasyShop offers a hassle-free <strong>10-day return or replacement guarantee</strong> on eligible products. If you are not satisfied with your purchase, you can initiate a request within 10 days of package delivery.
                  </p>
                  
                  <div className="bg-yellow-50/50 border-l-4 border-amber-400 p-4 text-xs text-amber-800 rounded">
                    <strong>⚠️ Please Note:</strong> Items must be returned in their original packaging, unused, with all brand tags, manuals, and accessories intact.
                  </div>

                  <h3 className="font-bold text-gray-800 text-sm mt-4">Returnable Categories &amp; Windows:</h3>
                  <ul className="list-disc pl-5 space-y-2 text-xs">
                    <li><strong>Electronics &amp; Mobiles:</strong> Eligible for free replacement/refund within 7 days in case of manufacturing defects.</li>
                    <li><strong>Fashion &amp; Apparel:</strong> Eligible for free returns or exchanges for sizing issues within 10 days.</li>
                    <li><strong>Home &amp; Kitchen Appliances:</strong> Eligible for replacements within 10 days.</li>
                  </ul>
                </div>
              )}

              {/* Terms of Use */}
              {activeTab === 'terms' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <FileText className="text-[#2874f0]" size={20} /> Terms of Use &amp; Service Agreement
                  </h2>
                  <p className="text-xs text-gray-400">Last updated: May 20, 2026</p>
                  <p>
                    Welcome to EasyShop. This document sets out the legal terms under which we provide services to you. By registering, browsing, or placing an order on our platform, you agree to comply with these terms.
                  </p>
                  
                  <h3 className="font-bold text-gray-800 text-sm mt-4">1. Account Registration</h3>
                  <p>
                    To place an order, you must create a secure shopper account. You are solely responsible for maintaining the confidentiality of your login credentials and must alert us immediately of any unauthorized account access.
                  </p>

                  <h3 className="font-bold text-gray-800 text-sm mt-4">2. Pricing &amp; Inventory</h3>
                  <p>
                    While we strive to maintain high accuracy, pricing or catalog inventory errors may occur. In such instances, EasyShop reserves the absolute right to cancel the transaction and issue a full refund to the buyer.
                  </p>
                </div>
              )}

              {/* Security Policy */}
              {activeTab === 'security' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <ShieldCheck className="text-[#2874f0]" size={20} /> Advanced Security Standards
                  </h2>
                  <p>
                    At EasyShop, securing your sensitive personal and financial transaction data is our highest operational priority. We utilize state-of-the-art server protection and encryption methodologies.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded">
                      <div className="font-bold text-gray-800 text-xs mb-1">🔐 256-Bit SSL Encryption</div>
                      <p className="text-xs text-gray-500">All information transmitted between your browser and our server is secured with high-grade SHA-256 secure socket layers.</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded">
                      <div className="font-bold text-gray-800 text-xs mb-1">💳 PCI-DSS Compliant Payments</div>
                      <p className="text-xs text-gray-500">We do not store your credit card credentials. Payment transaction processing is handled via certified PCI-DSS compliant third-party gateways.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Policy */}
              {activeTab === 'privacy' && (
                <div className="space-y-4 animate-fadeIn">
                  <h2 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                    <Scale className="text-[#2874f0]" size={20} /> Privacy and Data Security Policy
                  </h2>
                  <p>
                    EasyShop respects your personal privacy. This statement explains what data we collect from you, how we utilize it, and with whom it may be shared in order to deliver e-commerce services.
                  </p>

                  <h3 className="font-bold text-gray-800 text-sm mt-4">What information do we collect?</h3>
                  <p>
                    We collect your Name, Email Address, Contact Number, and Delivery/Billing addresses during checkout. We use cookies to store session states, cart states, and remember preferences.
                  </p>

                  <h3 className="font-bold text-gray-800 text-sm mt-4">Data Sharing Disclosures:</h3>
                  <p>
                    We strictly **do not sell** shopper information to advertising networks. Your shipping addresses and phone numbers are shared *exclusively* with contracted logistics service partners in order to facilitate delivery.
                  </p>
                </div>
              )}

            </article>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default function PolicyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between" />}>
      <PolicyPortal />
    </Suspense>
  )
}
